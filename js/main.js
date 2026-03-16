(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const yearSpan = document.getElementById('year');

  // Set year in footer
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Load stored theme
  const storedTheme = localStorage.getItem('hw-theme');
  if (storedTheme === 'light' || storedTheme === 'dark') {
    root.setAttribute('data-theme', storedTheme);
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('hw-theme', next);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Projects toggle
  const toggleBtn = document.getElementById('toggle-projects');
  const projectsGrid = document.querySelector('.projects-grid');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      projectsGrid.classList.toggle('expanded');
      toggleBtn.textContent = projectsGrid.classList.contains('expanded')
        ? 'Show Less Projects'
        : 'Show More Projects';
    });
  }

  // Back to top button
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // YouTube Feed - Get latest videos
  async function loadYouTubeFeed() {
    const feedContainer = document.getElementById('youtube-feed');
    const channelUsername = 'hardlyware';
    
    try {
      // Note: YouTube API requires API key. Using a sample public key for demonstration.
      // For production, replace with your own YouTube API key from Google Cloud Console
      const apiKey = 'AIzaSyAAmRZjyvtCFzV9ZYmLS8ZAir2GGnQL1qg';
      
      // Get channel ID from username
      let channelId = null;
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channelUsername}&type=channel&key=${apiKey}`
      );
      const channelData = await channelResponse.json();
      
      if (channelData.items && channelData.items.length > 0) {
        channelId = channelData.items[0].id.channelId;
      }
      
      if (!channelId) throw new Error('Channel not found');
      
      // Get latest uploads
      const uploadsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=4&order=date&type=video&key=${apiKey}`
      );
      const uploadsData = await uploadsResponse.json();
      
      if (!uploadsData.items || uploadsData.items.length === 0) {
        throw new Error('No videos found');
      }
      
      let html = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">';
      uploadsData.items.forEach(video => {
        const title = video.snippet.title;
        const videoId = video.id.videoId;
        const thumbnail = video.snippet.thumbnails.medium.url;
        const uploadDate = new Date(video.snippet.publishedAt).toLocaleDateString();
        
        html += `
          <div class="youtube-video">
            <a href="https://youtube.com/watch?v=${videoId}" target="_blank" rel="noopener">
              <img src="${thumbnail}" alt="${title}">
            </a>
            <div class="youtube-video-info">
              <div class="youtube-video-title">${title.substring(0, 40)}${title.length > 40 ? '...' : ''}</div>
              <div class="youtube-video-stats">${uploadDate}</div>
            </div>
          </div>
        `;
      });
      html += '</div>';
      
      feedContainer.innerHTML = html;
    } catch (error) {
      feedContainer.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
          <p>Latest videos</p>
          <a href="https://youtube.com/hardlyware" target="_blank" rel="noopener" style="color: var(--color-accent);">Visit YouTube →</a>
        </div>
      `;
    }
  }

  // YouTube Channel Stats - Get subscribers and total views
  async function loadYouTubeStats() {
    const feedContainer = document.getElementById('youtube-stats');
    const channelUsername = 'hardlyware';
   
    // const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || 'YOUR_API_KEY_HERE';
    const apiKey = window.YOUTUBE_API_KEY || 'YOUR_API_KEY_HERE';

    if (apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('YouTube API key not configured');
    }
    
    try {
      // Get channel ID from username
      let channelId = null;
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channelUsername}&type=channel&key=${apiKey}`
      );
      const channelData = await channelResponse.json();
      
      if (channelData.items && channelData.items.length > 0) {
        channelId = channelData.items[0].id.channelId;
      }
      
      if (!channelId) throw new Error('Channel not found');
      
      // Get channel statistics
      const statsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
      );
      const statsData = await statsResponse.json();
      
      if (!statsData.items || statsData.items.length === 0) {
        throw new Error('Stats not available');
      }
      
      const stats = statsData.items[0].statistics;
      const subscribers = parseInt(stats.subscriberCount) || 0;
      const totalViews = parseInt(stats.viewCount) || 0;
      
      // Get most viewed video
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=viewCount&type=video&maxResults=1&key=${apiKey}`
      );
      const videosData = await videosResponse.json();
      
      let topVideoHtml = '';
      if (videosData.items && videosData.items.length > 0) {
        const topVideo = videosData.items[0];
        const videoId = topVideo.id.videoId;
        
        // Get view count for the top video
        const videoStatsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`
        );
        const videoStatsData = await videoStatsResponse.json();
        const videoViews = videoStatsData.items[0].statistics.viewCount || 0;
        
        topVideoHtml = `
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
            <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">Most Popular Video</div>
            <a href="https://youtube.com/watch?v=${videoId}" target="_blank" rel="noopener" style="
              color: var(--color-accent);
              text-decoration: none;
              font-weight: 600;
              font-size: 0.9rem;
              word-break: break-word;
              display: block;
              margin-bottom: 0.3rem;
            ">
              ${topVideo.snippet.title}
            </a>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">
              👁️ ${parseInt(videoViews).toLocaleString()} views
            </div>
          </div>
        `;
      }
      
      const html = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">Subscribers</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--color-accent);">� ${parseInt(subscribers).toLocaleString()}</div>
          </div>
          <div>
            <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">Total Views</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--color-accent);">👁️ ${parseInt(totalViews).toLocaleString()}</div>
          </div>
          ${topVideoHtml}
          <a href="https://youtube.com/@hardlyware" target="_blank" rel="noopener" style="
            display: inline-block;
            padding: 0.6rem 1rem;
            background: rgba(255, 122, 26, 0.08);
            border: 1px solid var(--color-border);
            border-radius: 6px;
            color: var(--color-accent);
            text-decoration: none;
            font-size: 0.85rem;
            text-align: center;
            transition: border-color 0.18s ease, background 0.18s ease;
            margin-top: 0.5rem;
          ">
            Visit Channel →
          </a>
        </div>
      `;
      
      feedContainer.innerHTML = html;
    } catch (error) {
      feedContainer.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
          <p>Channel stats</p>
          <a href="https://youtube.com/@hardlyware" target="_blank" rel="noopener" style="color: var(--color-accent);">Visit YouTube →</a>
        </div>
      `;
    }
  }

  // GitHub Activity - Get recent activity
  async function loadGitHubActivity() {
    const feedContainer = document.getElementById('github-activity');
    const username = 'hardlyware';
    
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=8`);
      const repos = await response.json();
      
      if (!Array.isArray(repos) || repos.length === 0) {
        throw new Error('No repositories found');
      }
      
      let html = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem;">';
      repos.forEach(repo => {
        const pushed = new Date(repo.pushed_at).toLocaleDateString();
        const language = repo.language || 'Unknown';
        const stars = repo.stargazers_count || 0;
        const description = repo.description || 'No description';
        
        html += `
          <a href="${repo.html_url}" target="_blank" rel="noopener" style="
            padding: 0.8rem;
            background: rgba(255, 122, 26, 0.08);
            border: 1px solid var(--color-border);
            border-radius: 8px;
            text-decoration: none;
            transition: border-color 0.18s ease, background 0.18s ease;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
          " class="repo-card">
            <div style="font-weight: 600; color: var(--color-accent); font-size: 0.9rem;">${repo.name}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); flex: 1;">${description.substring(0, 50)}${description.length > 50 ? '...' : ''}</div>
            <div style="font-size: 0.7rem; color: var(--color-text-muted); display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <span>${language}</span>
              <span>⭐ ${stars}</span>
              <span>${pushed}</span>
            </div>
          </a>
        `;
      });
      html += '</div>';
      
      feedContainer.innerHTML = html;
      
      // Add hover effects
      document.querySelectorAll('.repo-card').forEach(card => {
        card.addEventListener('mouseover', () => {
          card.style.borderColor = 'var(--color-accent)';
          card.style.background = 'rgba(255, 122, 26, 0.12)';
        });
        card.addEventListener('mouseout', () => {
          card.style.borderColor = 'var(--color-border)';
          card.style.background = 'rgba(255, 122, 26, 0.08)';
        });
      });
    } catch (error) {
      feedContainer.innerHTML = `
        <p>Unable to load repositories. <a href="https://github.com/${username}" target="_blank" rel="noopener" style="color: var(--color-accent);">Visit GitHub →</a></p>
      `;
    }
  }

  // Instagram Feed - lightweight solution
  async function loadInstagramFeed() {
    const feedContainer = document.getElementById('instagram-feed');
    const username = 'hardlyware';
    
    try {
      feedContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <p style="margin-bottom: 1rem;">Follow for project updates & behind-the-scenes</p>
          <a href="https://instagram.com/${username}" target="_blank" rel="noopener" style="
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
            color: white;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.9rem;
          ">
            @${username}
          </a>
        </div>
      `;
    } catch (error) {
      feedContainer.innerHTML = `<p>Unable to load. <a href="https://instagram.com/${username}" target="_blank" rel="noopener" style="color: var(--color-accent);">Visit Instagram →</a></p>`;
    }
  }

  // Load feeds when page is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadYouTubeFeed();
      loadYouTubeStats();
      loadGitHubActivity();
      loadInstagramFeed();
    });
  } else {
    loadYouTubeFeed();
    loadYouTubeStats();
    loadGitHubActivity();
    loadInstagramFeed();
  }
})();
