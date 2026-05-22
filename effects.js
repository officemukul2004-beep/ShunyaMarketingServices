// Shunya Premium UI - 3D & Advanced Effects
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize 3D Hero Background if container is present
  const heroContainer = document.getElementById("hero-3d-container");
  if (heroContainer && typeof THREE !== "undefined") {
    init3DHero(heroContainer);
  }

  // 2. Initialize 3D Interactive Card Tilts
  initCardTilts();

  // 3. Load Dynamic SEO Configurations
  loadSEO();

  // 4. Bind Contact Form Handlers
  initContactForm();

  // 5. Load Dynamic Blog Articles
  initDynamicBlogs();
});

// --- 3D Hero Particle Space (Three.js) ---
function init3DHero(container) {
  let scene, camera, renderer, group, particles, torusKnot;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  const getDimensions = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || 800;
    return { w, h };
  };

  const { w, h } = getDimensions();

  // Scene setup
  scene = new THREE.Scene();

  // Camera setup
  camera = new THREE.PerspectiveCamera(60, w / h, 1, 1000);
  camera.position.z = 32;

  // Group to hold all 3D components for easy rotation
  group = new THREE.Group();
  scene.add(group);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);

  // Style the canvas element to fill container exactly
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  renderer.domElement.style.pointerEvents = "none";

  container.appendChild(renderer.domElement);

  // Geometry: Sphere of glowing particles
  const particleCount = 1000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorPrimary = new THREE.Color("#000000");
  const colorSecondary = new THREE.Color("#00647a");

  for (let i = 0; i < particleCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 15 + Math.random() * 8; // Radius range

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const mixRatio = Math.random();
    const finalColor = colorPrimary.clone().lerp(colorSecondary, mixRatio);
    colors[i * 3] = finalColor.r;
    colors[i * 3 + 1] = finalColor.g;
    colors[i * 3 + 2] = finalColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const createParticleTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(canvas);
  };

  const material = new THREE.PointsMaterial({
    size: 0.6,
    map: createParticleTexture(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  });

  particles = new THREE.Points(geometry, material);
  group.add(particles);

  // Centered Wireframe Torus Knot
  const torusGeo = new THREE.TorusKnotGeometry(9, 2.5, 100, 16);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending
  });
  torusKnot = new THREE.Mesh(torusGeo, torusMat);
  group.add(torusKnot);

  // Mouse move handler
  const onMouseMove = (e) => {
    const halfX = window.innerWidth / 2;
    const halfY = window.innerHeight / 2;
    mouseX = (e.clientX - halfX) / 100;
    mouseY = (e.clientY - halfY) / 100;
  };
  window.addEventListener("mousemove", onMouseMove);

  // ResizeObserver replaces traditional window resize listener for absolute layout reliability
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      const width = entry.contentRect.width || container.clientWidth || window.innerWidth;
      const height = entry.contentRect.height || container.clientHeight || 800;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  });
  resizeObserver.observe(container);

  // Animation Loop
  const animate = () => {
    requestAnimationFrame(animate);

    particles.rotation.y += 0.0006;
    particles.rotation.x += 0.0003;

    torusKnot.rotation.y -= 0.0015;
    torusKnot.rotation.z += 0.0008;

    targetX = mouseY * 0.2;
    targetY = mouseX * 0.2;

    group.rotation.x += (targetX - group.rotation.x) * 0.05;
    group.rotation.y += (targetY - group.rotation.y) * 0.05;

    renderer.render(scene, camera);
  };

  animate();
}

// --- 3D Interactive Card Tilt Effect ---
function initCardTilts() {
  const cards = document.querySelectorAll(".light-glass-card, .hover-lift, .grid > div:not(.space-y-6):not(.space-y-4)");

  cards.forEach(card => {
    // Avoid applying to simple flex/column containers or header items
    if (card.classList.contains("space-y-12") || card.offsetHeight < 100) return;

    card.style.transformStyle = "preserve-3d";
    card.style.perspective = "1000px";

    // Add default transition
    card.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s cubic-bezier(0.22, 1, 0.36, 1)";

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;

      // Max tilt angles: X = 12 deg, Y = 12 deg
      const rotateX = ((y / h) - 0.5) * -12;
      const rotateY = ((x / w) - 0.5) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
      card.style.boxShadow = "0 30px 60px -15px rgba(106, 28, 246, 0.16)";

      // Inner parallax elements
      const innerPop = card.querySelectorAll(".material-symbols-outlined, h3, p, a, button, .chip");
      innerPop.forEach(el => {
        el.style.transform = "translateZ(35px)";
        el.style.transition = "transform 0.1s ease";
      });
    });

    card.addEventListener("mouseleave", () => {
      // Reset card layout
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
      card.style.boxShadow = "";

      const innerPop = card.querySelectorAll(".material-symbols-outlined, h3, p, a, button, .chip");
      innerPop.forEach(el => {
        el.style.transform = "translateZ(0px)";
        el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
      });
    });
  });
}

// --- SEO Dynamic Loader ---
async function loadSEO() {
  try {
    let page = window.location.pathname.split("/").pop().replace(".html", "") || "index";
    if (page === "dist/index" || page === "dist/") page = "index";
    const res = await fetch(`/api/seo/${page}`);
    if (res.ok) {
      const data = await res.json();
      if (data.title) document.title = data.title;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (data.description) {
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.name = "description";
          document.head.appendChild(metaDesc);
        }
        metaDesc.content = data.description;
      }

      let metaKey = document.querySelector('meta[name="keywords"]');
      if (data.keywords) {
        if (!metaKey) {
          metaKey = document.createElement('meta');
          metaKey.name = "keywords";
          document.head.appendChild(metaKey);
        }
        metaKey.content = data.keywords;
      }
    }
  } catch (err) {
    console.warn("Dynamic SEO unavailable during dev server offline.", err);
  }
}

// --- Contact Form Submission Manager ---
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("contact-name").value;
    const phone = document.getElementById("contact-phone").value;
    const bizType = document.getElementById("contact-biz-type").value;
    const message = document.getElementById("contact-message").value;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="relative z-10 flex items-center justify-center gap-3">Sending...</span>`;

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, bizType, message })
      });

      if (res.ok) {
        showToast("Success! Your growth audit request has been sent.", "success");
        form.reset();
      } else {
        showToast("Error sending message. Please try again.", "error");
      }
    } catch (err) {
      showToast("Server unreachable. Please check your network.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `fixed bottom-8 left-8 z-[100] px-6 py-4 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all duration-500 translate-y-10 opacity-0 ${
    type === "success" 
      ? "bg-green-500/20 border-green-500/30 text-green-200" 
      : "bg-red-500/20 border-red-500/30 text-red-200"
  }`;
  toast.style.fontFamily = "'Outfit', sans-serif";
  toast.style.fontWeight = "bold";
  toast.innerHTML = message;
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.remove("translate-y-10", "opacity-0");
  }, 10);

  // Remove toast
  setTimeout(() => {
    toast.classList.add("translate-y-10", "opacity-0");
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// --- Dynamic Blog Engine ---
async function initDynamicBlogs() {
  const featuredContent = document.getElementById("featured-content");
  const featuredImage = document.getElementById("featured-image");
  const featuredTitle = document.getElementById("featured-title");
  const featuredSummary = document.getElementById("featured-summary");
  const sidebarCategories = document.getElementById("sidebar-categories");
  const archiveGrid = document.getElementById("archive-posts-grid");

  if (!featuredContent && !archiveGrid) return;

  try {
    const res = await fetch("/api/blogs");
    if (!res.ok) return;
    const blogs = await res.json();
    if (!blogs || blogs.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const activeSlug = params.get("slug");
    
    let activeBlog = blogs[0];
    if (activeSlug) {
      const found = blogs.find(b => b.slug === activeSlug);
      if (found) activeBlog = found;
    }

    if (featuredTitle) featuredTitle.textContent = activeBlog.title;
    if (featuredSummary) featuredSummary.textContent = activeBlog.summary || activeBlog.title;
    if (featuredImage) {
      featuredImage.src = activeBlog.image;
      featuredImage.alt = activeBlog.title;
    }
    if (featuredContent) {
      featuredContent.innerHTML = activeBlog.content;
    }

    if (archiveGrid) {
      archiveGrid.innerHTML = "";
      const otherBlogs = blogs.filter(b => b.id !== activeBlog.id);
      const blogsToRender = otherBlogs.length > 0 ? otherBlogs : blogs;

      blogsToRender.forEach(blog => {
        const item = document.createElement("div");
        item.className = "group cursor-pointer light-glass-card p-6 rounded-3xl border border-outline-variant/15 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5";
        item.style.transformStyle = "preserve-3d";
        item.style.perspective = "1000px";
        
        item.innerHTML = `
          <div class="aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-surface-container-low">
              <img alt="${blog.title}"
                  class="w-full h-full object-cover transition-transform group-hover:scale-105"
                  src="${blog.image}" />
          </div>
          <span class="text-primary font-label text-[10px] uppercase tracking-widest font-bold mb-3 block">${blog.category}</span>
          <h5 class="font-headline font-bold text-xl group-hover:text-primary transition-colors mb-3">${blog.title}</h5>
          <p class="text-on-surface-variant text-sm line-clamp-2">${blog.summary}</p>
        `;

        item.addEventListener("click", () => {
          window.location.href = `blog.html?slug=${blog.slug}`;
        });

        archiveGrid.appendChild(item);
      });
      
      if (typeof initCardTilts === "function") {
        initCardTilts();
      }
    }

    if (sidebarCategories) {
      sidebarCategories.innerHTML = "";
      const categoriesMap = {};
      blogs.forEach(b => {
        categoriesMap[b.category] = (categoriesMap[b.category] || 0) + 1;
      });

      Object.entries(categoriesMap).forEach(([cat, count]) => {
        const catLink = document.createElement("div");
        catLink.className = "flex items-center justify-between group p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer";
        catLink.innerHTML = `
          <span class="text-on-surface-variant group-hover:text-primary font-medium transition-colors">${cat}</span>
          <span class="text-xs bg-surface-container-high px-2 py-1 rounded-md text-on-surface-variant">${count}</span>
        `;
        sidebarCategories.appendChild(catLink);
      });
    }

  } catch (error) {
    console.error("Failed to load dynamic blog content:", error);
  }
}
