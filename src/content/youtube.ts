// YouTube-specific content filter

import type { YouTubeVideo } from '../services/types';

export class YouTubeFilter {
  private observer: MutationObserver | null = null;
  private processedVideos = new Set<string>();

  initialize() {
    console.log('YouTube filter initialized');
    
    // Wait for document.body to be available
    if (document.body) {
      this.start();
    } else {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        setTimeout(() => this.start(), 100);
      }
    }
  }

  private start() {
    // Initial filtering
    this.filterContent();
    
    // Watch for dynamic content
    this.setupObserver();
  }

  private setupObserver() {
    // Make sure body exists before observing
    if (!document.body) {
      console.warn('YouTube filter: document.body not available yet');
      setTimeout(() => this.setupObserver(), 100);
      return;
    }

    this.observer = new MutationObserver(() => {
      // Debounce filtering
      this.scheduleFiltering();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private filterTimeoutId: number | null = null;

  private scheduleFiltering() {
    if (this.filterTimeoutId) {
      clearTimeout(this.filterTimeoutId);
    }
    
    this.filterTimeoutId = window.setTimeout(() => {
      this.filterContent();
    }, 500);
  }

  private async filterContent() {
    // Filter based on current page
    const url = window.location.href;
    
    if (url.includes('/watch')) {
      await this.filterVideoPage();
    } else if (url.includes('/feed') || url === 'https://www.youtube.com/') {
      await this.filterHomeFeed();
    }
    
    // Always filter recommendations
    await this.filterRecommendations();
  }

  private async filterVideoPage() {
    // Check if current video should be blocked
    const videoId = new URLSearchParams(window.location.search).get('v');
    if (!videoId) return;
    
    const title = document.querySelector('h1.title yt-formatted-string')?.textContent || '';
    const description = document.querySelector('#description')?.textContent || '';
    
    // Ask background script to check
    const response = await chrome.runtime.sendMessage({
      type: 'CHECK_URL',
      payload: {
        url: window.location.href,
        title: `${title} ${description}`,
      },
    });
    
    if (response.classification && !response.classification.relevant) {
      this.blockVideoPlayback(response.classification.reason);
    }
  }

  private blockVideoPlayback(reason: string) {
    // Pause video
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) {
      video.pause();
      video.style.filter = 'blur(20px)';
    }
    
    // Show overlay
    const player = document.querySelector('#movie_player');
    if (player && !document.querySelector('.dot-focus-blocker')) {
      const overlay = document.createElement('div');
      overlay.className = 'dot-focus-blocker';
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: white;
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 40px;
      `;
      
      overlay.innerHTML = `
        <div>
          <h2 style="font-size: 32px; margin-bottom: 16px;">🎯 Stay Focused</h2>
          <p style="font-size: 18px; margin-bottom: 8px;">This video is not related to your focus goal</p>
          <p style="font-size: 14px; opacity: 0.7;">${reason}</p>
        </div>
      `;
      
      player.appendChild(overlay);
    }
  }

  private async filterHomeFeed() {
    const videos = this.extractVideosFromFeed();
    if (videos.length === 0) return;
    
    // Filter new videos only
    const newVideos = videos.filter(v => !this.processedVideos.has(v.id));
    if (newVideos.length === 0) return;
    
    // Batch check relevance
    const response = await chrome.runtime.sendMessage({
      type: 'FILTER_CONTENT',
      payload: {
        url: window.location.href,
        videos: newVideos.map(v => ({
          id: v.id,
          title: v.title,
          channelName: v.channelName,
        })),
      },
    });
    
    if (response.success && response.videosToHide) {
      response.videosToHide.forEach((id: string) => {
        const video = videos.find(v => v.id === id);
        if (video) {
          (video.element as HTMLElement).style.display = 'none';
          this.processedVideos.add(id);
        }
      });
    }
  }

  private async filterRecommendations() {
    // Filter sidebar recommendations on video page
    const recommendations = document.querySelectorAll('ytd-compact-video-renderer');
    
    recommendations.forEach(async (rec) => {
      const videoId = rec.querySelector('a')?.getAttribute('href')?.split('v=')[1];
      if (!videoId || this.processedVideos.has(videoId)) return;
      
      const title = rec.querySelector('#video-title')?.textContent || '';
      const channel = rec.querySelector('#channel-name')?.textContent || '';
      
      const response = await chrome.runtime.sendMessage({
        type: 'CHECK_URL',
        payload: {
          url: `https://www.youtube.com/watch?v=${videoId}`,
          title: `${title} ${channel}`,
        },
      });
      
      if (response.classification && !response.classification.relevant) {
        (rec as HTMLElement).style.display = 'none';
        this.processedVideos.add(videoId);
      }
    });
  }

  private extractVideosFromFeed(): YouTubeVideo[] {
    const videos: YouTubeVideo[] = [];
    
    // Home feed videos
    const videoElements = document.querySelectorAll('ytd-rich-item-renderer');
    
    videoElements.forEach(el => {
      const link = el.querySelector('a#thumbnail');
      const videoId = link?.getAttribute('href')?.split('v=')[1];
      const title = el.querySelector('#video-title')?.textContent || '';
      const channel = el.querySelector('#channel-name')?.textContent || '';
      
      if (videoId) {
        videos.push({
          id: videoId,
          title: title.trim(),
          channelName: channel.trim(),
          element: el,
        });
      }
    });
    
    return videos;
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.filterTimeoutId) {
      clearTimeout(this.filterTimeoutId);
    }
  }
}
