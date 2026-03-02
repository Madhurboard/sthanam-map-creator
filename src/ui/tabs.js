/**
 * tabs.js — Unified Mobile & Desktop Tab System
 * Extracted from form.js. Call setupTabs() once during init.
 */

export function setupTabs() {
	const sidebar = document.getElementById('main-sidebar');
	const tabBtns = document.querySelectorAll('.mobile-tab-btn, .desktop-tab-btn');
	const tabPanes = document.querySelectorAll('.tab-pane');

	if (!sidebar || tabBtns.length === 0) return;

	// Initialize active tab to location on desktop, null on mobile
	let activeTab = window.innerWidth >= 768 ? 'location' : null;

	tabBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			const target = btn.dataset.tabTarget;
			const isDesktopBtn = btn.classList.contains('desktop-tab-btn');

			if (activeTab === target && !isDesktopBtn) {
				// Toggle off if clicking the active tab (Mobile only)
				activeTab = null;
				document.body.classList.remove('mobile-tab-active');
				sidebar.classList.remove('max-md:opacity-100', 'max-md:translate-y-0', 'max-md:pointer-events-auto');
				sidebar.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');

				// Reset mobile button styles
				tabBtns.forEach(b => {
					if (!b.classList.contains('desktop-tab-btn')) {
						b.classList.remove('text-accent');
						b.classList.add('text-slate-500');
					}
				});
			} else {
				// Switch to new tab
				activeTab = target;
				if (!isDesktopBtn) document.body.classList.add('mobile-tab-active');

				// Update button styles
				tabBtns.forEach(b => {
					const isTarget = b.dataset.tabTarget === target;
					if (b.classList.contains('desktop-tab-btn')) {
						if (isTarget) {
							b.classList.add('text-accent', 'border-accent');
							b.classList.remove('text-slate-500', 'border-transparent');
						} else {
							b.classList.remove('text-accent', 'border-accent');
							b.classList.add('text-slate-500', 'border-transparent');
						}
					} else {
						if (isTarget) {
							b.classList.add('text-accent');
							b.classList.remove('text-slate-500');
						} else {
							b.classList.remove('text-accent');
							b.classList.add('text-slate-500');
						}
					}
				});

				// Show correct pane, hide others
				tabPanes.forEach(pane => {
					if (pane.dataset.tabContent === target) {
						pane.classList.remove('hidden');
					} else {
						pane.classList.add('hidden');
					}
				});

				// Reveal sidebar on mobile
				if (!isDesktopBtn) {
					sidebar.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
					sidebar.classList.add('max-md:opacity-100', 'max-md:translate-y-0', 'max-md:pointer-events-auto');
				}
			}
		});
	});

	// Click outside to dismiss on mobile
	document.addEventListener('click', (e) => {
		if (window.innerWidth >= 768 || !activeTab) return;
		if (!sidebar.contains(e.target) && !e.target.closest('.mobile-tab-btn')) {
			activeTab = null;
			document.body.classList.remove('mobile-tab-active');
			sidebar.classList.remove('max-md:opacity-100', 'max-md:translate-y-0', 'max-md:pointer-events-auto');
			sidebar.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
			tabBtns.forEach(b => {
				if (!b.classList.contains('desktop-tab-btn')) {
					b.classList.remove('text-accent');
					b.classList.add('text-slate-500');
				}
			});
		}
	});
}
