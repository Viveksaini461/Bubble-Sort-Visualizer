(function() {
	const SITE_URL = 'https://yourdomain.com';
	const IS_SUBPAGE = location.pathname.includes('/categories/') || location.pathname.includes('/articles/');
	const BASE = IS_SUBPAGE ? '../' : '';
	const DATA_URL = `${BASE}data/data.json`;

	function $(selector, scope) {
		return (scope || document).querySelector(selector);
	}
	function $all(selector, scope) {
		return Array.from((scope || document).querySelectorAll(selector));
	}
	function formatDate(iso) {
		try {
			const d = new Date(iso);
			return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
		} catch(e) { return iso; }
	}
	function slugify(text) {
		return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
	}

	async function loadTemplate(id, url) {
		const el = document.getElementById(id);
		if (!el) return;
		const res = await fetch(`${BASE}${url}`);
		el.innerHTML = await res.text();
	}

	function setActiveNav() {
		const path = location.pathname;
		$all('header nav a').forEach(a => {
			const href = a.getAttribute('href');
			if (!href) return;
			if (href === '/index.html' && (path === '/' || path.endsWith('/index.html'))) {
				a.classList.add('active');
			} else if (path.endsWith(href)) {
				a.classList.add('active');
			}
		});
	}

	async function loadData() {
		const res = await fetch(DATA_URL);
		return res.json();
	}

	function renderArticleCard(article) {
		const imageAlt = article.imageAlt || article.title;
		const articleUrl = `${BASE}articles/${article.slug}.html`;
		const imageUrl = `${BASE}${article.image}`;
		return `
			<article class="card">
				<a href="${articleUrl}" aria-label="Read ${article.title}">
					<div class="media"><img src="${imageUrl}" alt="${imageAlt}" loading="lazy" width="640" height="360"></div>
				</a>
				<div class="content">
					<div class="meta">
						<span>${formatDate(article.date)}</span>
						<span>•</span>
						<span class="tag">${article.category}</span>
						<span>•</span>
						<span>${article.readingTime} min read</span>
					</div>
					<h3 class="title"><a href="${articleUrl}">${article.title}</a></h3>
					<p class="excerpt">${article.excerpt}</p>
					<div class="actions">
						<a class="btn" href="${articleUrl}">Read More</a>
					</div>
				</div>
			</article>
		`;
	}

	function renderSidebarWidgets(data) {
		const trending = data.articles.filter(a => a.isTrending).slice(0, 5);
		const recentComments = data.comments.slice(0, 5);
		const trendingList = trending.map(a => `
			<a class="item" href="${BASE}articles/${a.slug}.html">
				<img src="${BASE}${a.image}" alt="${a.imageAlt || a.title}" loading="lazy" width="60" height="60">
				<div>
					<div class="small">${formatDate(a.date)}</div>
					<div>${a.title}</div>
				</div>
			</a>
		`).join('');
		const commentsList = recentComments.map(c => {
			const art = data.articles.find(a => a.id === c.articleId);
			return `
				<div>
					<div class="small">${c.author} on <a href="${BASE}articles/${art.slug}.html#comments">${art.title}</a></div>
					<div class="small">${formatDate(c.date)}</div>
				</div>
			`;
		}).join('');
		const sidebar = $('.sidebar');
		if (!sidebar) return;
		sidebar.innerHTML = `
			<div class="widget">
				<h3>Trending</h3>
				<div class="list">${trendingList}</div>
			</div>
			<div class="widget">
				<h3>Newsletter</h3>
				<form id="newsletter-form" aria-label="Newsletter signup" novalidate>
					<label for="newsletter-email">Get 1 actionable tip each week</label>
					<input class="input" id="newsletter-email" type="email" placeholder="you@example.com" required aria-required="true">
					<div style="display:flex;gap:8px;margin-top:8px;">
						<button class="btn" type="submit">Subscribe</button>
						<a class="btn secondary" href="${BASE}suggest.html">Suggest a topic</a>
					</div>
					<div id="newsletter-msg" class="small" role="status" style="margin-top:8px;"></div>
				</form>
			</div>
			<div class="widget">
				<h3>Recent comments</h3>
				<div class="list">${commentsList}</div>
			</div>
			<div class="widget ad">
				<strong>Ad space</strong>
				<div class="small">300x250 • Optimized for AdSense</div>
				<!-- AdSense placeholder -->
			</div>
		`;
		bindNewsletterForm();
	}

	function bindNewsletterForm() {
		const form = document.getElementById('newsletter-form');
		if (!form) return;
		form.addEventListener('submit', function(e) {
			e.preventDefault();
			const email = document.getElementById('newsletter-email').value.trim();
			const msg = document.getElementById('newsletter-msg');
			if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
				msg.textContent = 'Please enter a valid email.';
				msg.style.color = '#c0392b';
				return;
			}
			try {
				const saved = JSON.parse(localStorage.getItem('hf_newsletter') || '[]');
				saved.push({ email, at: Date.now() });
				localStorage.setItem('hf_newsletter', JSON.stringify(saved));
				msg.textContent = 'Thanks! You are subscribed. We will only email you when we have something truly useful.';
				msg.style.color = '#1b9e77';
				form.reset();
			} catch(err) {
				msg.textContent = 'Something went wrong. Please try again later.';
				msg.style.color = '#c0392b';
			}
		});
	}

	function renderHome(data) {
		const latestContainer = document.getElementById('home-latest');
		if (!latestContainer) return;
		const latest = [...data.articles].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
		latestContainer.innerHTML = latest.map(renderArticleCard).join('');
	}

	function renderCategory(data) {
		const el = document.getElementById('category-list');
		if (!el) return;
		const cat = el.getAttribute('data-category');
		const items = data.articles.filter(a => a.category === cat);
		el.innerHTML = items.map(renderArticleCard).join('');
		const h1 = document.querySelector('h1[data-category-title]');
		if (h1) h1.textContent = cat;
	}

	function renderRelated(data) {
		const container = document.getElementById('related-articles');
		if (!container) return;
		const currentSlug = document.body.getAttribute('data-article');
		const current = data.articles.find(a => a.slug === currentSlug);
		if (!current) return;
		const related = data.articles.filter(a => a.slug !== currentSlug && (a.category === current.category || a.tags.some(t => current.tags.includes(t)))).slice(0, 4);
		container.innerHTML = related.map(renderArticleCard).join('');
	}

	function bindShare() {
		$all('[data-share]').forEach(btn => {
			btn.addEventListener('click', () => {
				const url = btn.getAttribute('data-url') || location.href;
				const text = btn.getAttribute('data-text') || document.title;
				const t = btn.getAttribute('data-share');
				let shareUrl = '';
				if (t === 'twitter') shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
				if (t === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
				if (t === 'linkedin') shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
				window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=520');
			});
		});
	}

	function bindSuggestForm() {
		const form = document.getElementById('suggest-form');
		if (!form) return;
		const msg = document.getElementById('suggest-msg');
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			const payload = {
				name: form.querySelector('#s-name').value.trim(),
				email: form.querySelector('#s-email').value.trim(),
				topic: form.querySelector('#s-topic').value.trim(),
				details: form.querySelector('#s-details').value.trim(),
				at: Date.now()
			};
			if (!payload.topic) {
				msg.textContent = 'Please provide a topic idea.';
				msg.style.color = '#c0392b';
				return;
			}
			try {
				const saved = JSON.parse(localStorage.getItem('hf_suggestions') || '[]');
				saved.push(payload);
				localStorage.setItem('hf_suggestions', JSON.stringify(saved));
				msg.textContent = 'Thanks for your suggestion! We read every message.';
				msg.style.color = '#1b9e77';
				form.reset();
			} catch(err) {
				msg.textContent = 'Could not save your suggestion locally.';
				msg.style.color = '#c0392b';
			}
		});
	}

	async function init() {
		await loadTemplate('site-header', 'templates/header.html');
		await loadTemplate('site-footer', 'templates/footer.html');
		setActiveNav();
		bindShare();
		bindSuggestForm();
		try {
			const data = await loadData();
			renderHome(data);
			renderCategory(data);
			renderSidebarWidgets(data);
			renderRelated(data);
		} catch(err) {
			console.error('Failed to load data', err);
		}
	}

	document.addEventListener('DOMContentLoaded', init);
})();