(() => {
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  const STORAGE_KEY = 'group_order_urls';

  const loadUrls = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const saveUrl = (index, url) => {
    try {
      const urls = loadUrls();
      urls[index] = url;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
      updateHtmlFile(urls);
    } catch (e) {
      showToast('Failed to save URL');
    }
  };

  const updateHtmlFile = async (urls) => {
    try {
      const response = await fetch(window.location.href);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Update each row in the parsed document
      doc.querySelectorAll('.scenarios-row').forEach((row) => {
        const index = row.querySelector('.index').textContent;
        if (urls[index]) {
          const urlDiv = row.querySelector('.url');
          const openBtn = row.querySelector('.open');
          const copyBtn = row.querySelector('.copy');
          
          urlDiv.textContent = urls[index];
          openBtn.setAttribute('data-url', urls[index]);
          copyBtn.setAttribute('data-url', urls[index]);
        }
      });

      const updatedHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
      
      // Create a downloadable file
      const blob = new Blob([updatedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      a.click();
      URL.revokeObjectURL(url);
      
      showToast('HTML file downloaded');
    } catch (e) {
      console.error('Failed to update HTML:', e);
    }
  };

  const copyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); showToast('Copied URL'); }
    catch { showToast('Copy failed'); }
  };

  const showToast = (msg) => {
    let t = qs('#toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.style.position = 'fixed';
      t.style.bottom = '16px';
      t.style.left = '50%';
      t.style.transform = 'translateX(-50%)';
      t.style.background = '#16243a';
      t.style.color = '#e6eaf2';
      t.style.border = '1px solid #2a3550';
      t.style.padding = '8px 12px';
      t.style.borderRadius = '8px';
      t.style.boxShadow = '0 8px 30px rgba(0,0,0,.35)';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._t);
    t._t = setTimeout(() => (t.style.opacity = '0'), 1500);
  };

  const init = () => {
    const savedUrls = loadUrls();
    
    // Restore saved URLs
    qsa('.scenarios-row').forEach((row) => {
      const index = row.querySelector('.index').textContent;
      if (savedUrls[index]) {
        const urlDiv = row.querySelector('.url');
        const openBtn = row.querySelector('.open');
        const copyBtn = row.querySelector('.copy');
        urlDiv.textContent = savedUrls[index];
        openBtn.setAttribute('data-url', savedUrls[index]);
        copyBtn.setAttribute('data-url', savedUrls[index]);
      }
    });

    qsa('.scenarios .open').forEach((btn) => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    });
    qsa('.scenarios .copy').forEach((btn) => {
      btn.addEventListener('click', () => copyToClipboard(btn.getAttribute('data-url')));
    });
    qsa('.scenarios .update').forEach((btn) => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.scenarios-row');
        const input = row.querySelector('.url-input');
        const urlDiv = row.querySelector('.url');
        const openBtn = row.querySelector('.open');
        const copyBtn = row.querySelector('.copy');
        const index = row.querySelector('.index').textContent;
        const newUrl = input.value.trim();
        
        if (newUrl) {
          urlDiv.textContent = newUrl;
          openBtn.setAttribute('data-url', newUrl);
          copyBtn.setAttribute('data-url', newUrl);
          saveUrl(index, newUrl);
          input.value = '';
          showToast('URL updated and saved');
        } else {
          showToast('Please enter a URL');
        }
      });
    });
  };

  document.addEventListener('DOMContentLoaded', init);
})();


