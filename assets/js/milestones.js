/**
 * MacAgent Pro - Milestone Celebration Engine v1.0.0
 * Zero-dependency confetti + share-card generator
 */

;(() => {
    const toast = document.getElementById('legend-toast');
    const toastTitle = document.getElementById('legend-toast-title');
    const toastSub = document.getElementById('legend-toast-sub');
    const shareBtn = document.getElementById('legend-share-btn');
    const dlBtn = document.getElementById('legend-download-btn');

    // ---------- Confetti (no deps) ----------
    const confetti = (() => {
        const canvas = document.getElementById('legend-confetti');
        if (!canvas) return { burst: () => {} };
        const ctx = canvas.getContext('2d');
        let particles = [];
        let raf = 0;
        const colors = ['#a855f7','#f59e0b','#22c55e','#60a5fa','#ef4444','#eab308'];

        function resize() {
            const dpr = Math.max(1, window.devicePixelRatio || 1);
            canvas.width = Math.floor(innerWidth * dpr);
            canvas.height = Math.floor(innerHeight * dpr);
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            ctx.setTransform(dpr,0,0,dpr,0,0);
        }
        window.addEventListener('resize', resize, { passive: true });
        resize();

        function draw() {
            ctx.clearRect(0,0,innerWidth,innerHeight);
            const g = 0.25, drag = 0.995;
            particles.forEach(p => {
                p.vy += g;
                p.vx *= drag; p.vy *= drag;
                p.x += p.vx; p.y += p.vy;
                p.r += p.spin;
                p.life -= 16;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.r);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size*0.6, -p.size*0.3, p.size, p.size*0.6);
                ctx.restore();
            });
            particles = particles.filter(p => p.life > 0 && p.y < innerHeight + 20);
            if (particles.length) raf = requestAnimationFrame(draw); else stop();
        }

        function start() {
            if (raf) return;
            canvas.style.display = 'block';
            raf = requestAnimationFrame(draw);
        }
        function stop() {
            if (raf) cancelAnimationFrame(raf);
            raf = 0;
            canvas.style.display = 'none';
        }

        function burst({count=220, spread=Math.PI, power=12, origin=[innerWidth/2, innerHeight*0.2]}={}) {
            if (document.hidden) return; // save battery
            start();
            for (let i=0;i<count;i++) {
                const angle = (-spread/2) + Math.random()*spread;
                const speed = (power * 0.5) + Math.random()*power;
                particles.push({
                    x: origin[0], y: origin[1],
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - (power*0.2),
                    r: Math.random()*Math.PI,
                    spin: (Math.random()-0.5) * 0.3,
                    size: 6 + Math.random()*6,
                    color: colors[(Math.random()*colors.length)|0],
                    life: 900 + Math.random()*600
                });
            }
            // auto stop after ~1.4s
            setTimeout(() => { particles = []; }, 1400);
        }

        return { burst };
    })();

    // ---------- Share-card generator (Canvas → PNG Blob URL) ----------
    async function generateShareCard({ title='New milestone!', subtitle='', stats={} }) {
        const W = 1200, H = 630; // OG-friendly
        // Use OffscreenCanvas if available, else normal canvas
        const c = ('OffscreenCanvas' in window) ? new OffscreenCanvas(W,H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
        if (!('OffscreenCanvas' in window)) document.body.appendChild(c); // not shown, but ensure in DOM for some browsers
        const ctx = c.getContext('2d');

        // Background gradient
        const g = ctx.createLinearGradient(0,0,W,H);
        g.addColorStop(0, '#0b1020'); g.addColorStop(1, '#1f0e2f');
        ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

        // Glow ring
        ctx.shadowColor = 'rgba(168,85,247,0.8)'; ctx.shadowBlur = 50;
        ctx.strokeStyle = 'rgba(168,85,247,0.5)'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.roundRect(24,24,W-48,H-48,26); ctx.stroke();
        ctx.shadowBlur = 0;

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 72px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
        ctx.fillText('MacAgent Pro', 60, 140);
        ctx.fillStyle = '#c084fc';
        ctx.font = 'bold 58px ui-sans-serif, system-ui';
        ctx.fillText(title, 60, 230);

        // Subtitle
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '28px ui-sans-serif, system-ui';
        ctx.fillText(subtitle, 60, 280);

        // Stats pills
        const pill = (y, k, v) => {
            const text = `${k}: ${v}`;
            ctx.font = 'bold 34px ui-sans-serif, system-ui';
            const w = ctx.measureText(text).width;
            ctx.fillStyle = 'rgba(148,163,184,0.12)';
            ctx.beginPath(); ctx.roundRect(60, y-36, w+40, 60, 14); ctx.fill();
            ctx.fillStyle = '#e5e7eb'; ctx.fillText(text, 80, y+4);
        };
        let y = 370;
        Object.entries(stats).forEach(([k,v]) => { pill(y,k,v); y += 88; });

        // Footer
        ctx.fillStyle = '#94a3b8'; ctx.font = '24px ui-sans-serif, system-ui';
        ctx.fillText('legend.macagent.pro • #LivingLegend', 60, H-60);

        // To Blob URL
        const toBlob = () => new Promise(res => {
            if ('convertToBlob' in c) c.convertToBlob({ type: 'image/png' }).then(res);
            else c.toBlob(res, 'image/png', 1);
        });
        const blob = await toBlob();
        const url = URL.createObjectURL(blob);
        // cleanup stray canvas element if appended
        if (!( 'OffscreenCanvas' in window)) c.remove();
        return url;
    }

    // ---------- Toast/UI wiring ----------
    function showToast(title, sub, pngUrl) {
        if (!toast) return;
        toastTitle.textContent = title;
        toastSub.textContent = sub || '';
        dlBtn.href = pngUrl;
        toast.classList.remove('hidden');
        // auto hide after 8s
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => toast.classList.add('hidden'), 8000);
    }

    async function handleMilestone(detail = {}) {
        const { message, installs, p95, reliability } = detail || {};
        
        // Confetti 🎉
        confetti.burst({ count: 240, power: 13, origin: [innerWidth/2, innerHeight*0.25] });

        // Share card
        const stats = {};
        if (typeof installs === 'number') stats['Total Installs'] = installs.toLocaleString();
        if (typeof p95 === 'number') stats['P95 Latency'] = `${Math.round(p95)}ms`;
        if (typeof reliability === 'number') stats['Reliability'] = `${Number(reliability).toFixed(2)}%`;

        const pngUrl = await generateShareCard({
            title: message || 'Milestone Achieved!',
            subtitle: new Date().toLocaleString(),
            stats
        });

        // Toast
        showToast('Milestone Achieved!', message || 'A new milestone just landed.', pngUrl);

        // Share hook
        if (shareBtn) {
            shareBtn.onclick = async () => {
                try {
                    if (navigator.canShare && navigator.canShare({ files: [] })) {
                        const blob = await (await fetch(pngUrl)).blob();
                        const file = new File([blob], 'macagent-milestone.png', { type: 'image/png' });
                        await navigator.share({ title: 'MacAgent Pro Milestone', text: message || 'Milestone Achieved!', files: [file] });
                    } else {
                        // Fallback: open image in new tab
                        window.open(pngUrl, '_blank', 'noopener,noreferrer');
                    }
                } catch (e) {
                    console.warn('Share failed:', e);
                    window.open(pngUrl, '_blank', 'noopener,noreferrer');
                }
            };
        }
    }

    // Listen for milestone events
    window.addEventListener('legend:milestone', (e) => handleMilestone(e.detail));

    // Expose manual trigger for tests
    window.LegendCelebrateTest = () => {
        window.dispatchEvent(new CustomEvent('legend:milestone', {
            detail: { message: '15,000 installs 🎉', installs: 15000, p95: 187, reliability: 99.97 }
        }));
    };

    console.log('[Milestones] MacAgent Pro Milestone Celebration Engine loaded 🎉');
})();