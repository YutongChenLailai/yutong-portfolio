const projects = [
  {
    title: "PoopSlaves",
    role: "Speculative VR system.",
    medium: "VR · interaction · research",
    image: "assets/hero-01.png",
    copy: "A rule-based virtual economy where bodily waste becomes scarce, governable value. The work makes unequal extraction tangible through constrained agency.",
  },
  {
    title: "Plantiever’s Illusion",
    role: "Moving-image installation.",
    medium: "film · installation · cultural symbols",
    image: "assets/hero-02.png",
    copy: "A moving-image installation that keeps auspicious symbols recognisable while changing the conditions under which they are seen, felt and interpreted.",
  },
  {
    title: "The Forbidden Hue",
    role: "Heritage through virtual play.",
    medium: "VR game · heritage · narrative",
    image: "assets/hero-03.png",
    copy: "A cross-media VR experience that reconstructs Yao history through exploratory play, ritual space and multiple narrative paths.",
  },
  {
    title: "Value Machine",
    role: "Participatory art-market critique.",
    medium: "installation · Arduino · participation",
    image: "assets/hero-04.png",
    copy: "Visitors feed a fictional artist-machine, generate images and participate in their valuation, exposing how reputation manufactures artistic worth.",
  },
  {
    title: "Fetorium",
    role: "A social anatomy of stench.",
    medium: "installation · facial detection · media art",
    image: "assets/hero-05.png",
    copy: "Responsive puppets and facial recognition turn imagined odour into visible feedback, revealing how disgust and social boundaries are produced.",
  },
  {
    title: "Plated Fantasies",
    role: "A sensory dining fiction.",
    medium: "installation · TouchDesigner · perception",
    image: "assets/hero-06.png",
    copy: "An interactive table stages food as a culturally conditioned image, asking when appetite belongs to the body and when it is learned.",
  },
  {
    title: "Closet X",
    role: "AI wardrobe interface.",
    medium: "UX · AI recognition · virtual try-on",
    image: "assets/hero-07.png",
    copy: "A wardrobe-management system connecting garment recognition, personal styling, sustainable use and virtual dressing.",
  },
  {
    title: "Navigating the Past",
    role: "Urban memory in augmented reality.",
    medium: "AR · heritage · urban experience",
    image: "assets/hero-08.png",
    copy: "A multi-layered navigation experience reconnecting Harbin’s historic streets with archival stories, spatial memory and contemporary movement.",
  },
  {
    title: "Feeding Fear",
    role: "Experimental moving image.",
    medium: "video art · social psychology",
    image: "assets/hero-09.png",
    copy: "A visual investigation of how fear is repeatedly fed by institutions, environments and the social circulation of suspicion.",
  },
  {
    title: "Drown in Algae",
    role: "Ecological witnessing.",
    medium: "bio-art · coastal ecology · installation",
    image: "assets/hero-10.png",
    copy: "A bio-art system anchored in coastal pollution, combining environmental observation, algae-based material research and ecological repair.",
  },
];
const caseCn = [
  "一个把排泄物设为稀缺货币的推想式 VR 系统，让权力、价值与身体控制变得可感。",
  "以动态影像和空间装置重组传统吉祥符号，在熟悉与陌生之间激活文化记忆。",
  "通过 VR 游戏、叙事路径与仪式空间重新进入瑶族历史。",
  "邀请观众参与艺术生产与定价，揭示声誉如何制造价值。",
  "通过响应式木偶与面部识别，把“臭味”造成的社会边界转化成可见反馈。",
  "把餐桌变成感知实验，讨论食欲来自身体还是被训练的文化想象。",
  "连接衣物识别、个人造型、虚拟试穿与可持续管理的智能衣橱。",
  "用增强现实与分层导航连接哈尔滨历史街区、档案故事与当代行走。",
  "研究恐惧如何被环境、制度与社会传播持续喂养的实验影像。",
  "从沿海污染观察出发，以藻类材料与装置系统讨论生态修复。",
];
const making = [
  "I built the experience around character states, spatial hierarchy and repeated exchanges. Interactions were simplified until the economy could be understood through action rather than instruction.",
  "Compositing, 3D scenes and rhythmic edits formed the visual language. Projection and physical placement were tested together to control how each symbol was read.",
  "Storyboards, interaction flows, workshop feedback and successive VR scene tests shaped the work. Navigation and visual assets were refined as one system.",
  "Mechanism prototypes, Arduino control, printed outputs and visitor-journey tests gradually formed the installation. The interface was reduced to a few legible actions.",
  "Puppet construction, facial detection and TouchDesigner feedback were developed in parallel, with careful tuning between expression and response.",
  "Projection, object placement and TouchDesigner behaviours were composed as one responsive table, then tested for sightlines, timing and collective viewing.",
  "I mapped the service flow, designed the core screens and tested gesture browsing. AI recognition supports the experience without becoming its visual centre.",
  "Archival material was reorganised into spatial layers, routes and concise story moments. Interface tests balanced clear wayfinding with discovery.",
  "Staged footage, symbolic props, sound and compressed edits were assembled around repetition and escalation.",
  "Material experiments, feasibility studies, apparatus sketches, 3D renders and a service model were developed as one ecological system.",
];
const makingCn = [
  "制作围绕角色状态、空间等级与重复交换展开，让玩家通过行动而不是说明理解这套经济。",
  "通过合成、三维场景与节奏剪辑建立视觉语言，并同步测试投影和空间位置。",
  "制作经过故事板、交互流程、工作坊反馈与多轮 VR 场景测试，视觉和导航同步迭代。",
  "通过机械原型、Arduino 控制、打印输出与观众动线测试逐步完成装置。",
  "木偶制作、面部检测与 TouchDesigner 反馈并行开发，并反复调整响应时序。",
  "投影、物件与 TouchDesigner 行为被整合为同一套响应式餐桌系统。",
  "梳理服务流程、核心界面与手势浏览，让 AI 识别成为自然的辅助功能。",
  "档案材料被重组为空间图层、路线与短叙事节点，在导航与探索之间取得平衡。",
  "通过场景拍摄、象征性道具、声音与紧凑剪辑建立重复和升级的节奏。",
  "整合材料实验、技术验证、装置草图、三维渲染与服务模型。",
];
const projectTags = [
  ["Critical Design", "VR", "Speculative"],
  ["Culture", "Moving Image", "Installation"],
  ["Cultural Heritage", "VR", "Narrative"],
  ["Art & Value", "Installation", "Participation"],
  ["Social Behaviour", "Interactive Installation", "Technology"],
  ["Food Culture", "Installation", "Perception"],
  ["Product Design", "AI", "UX"],
  ["Cultural Heritage", "AR", "Architecture"],
  ["Moving Image", "Social Psychology"],
  ["Ecology", "Bio-art", "Installation"],
];
const projectVideos = [
  [
    {
      id: "-NzMnuMocVc",
      title: "PoopSlaves — Main Film",
      label: "Main film / 主片",
    },
    {
      id: "4yT4qBsznL8",
      title: "PoopSlaves — Final Interactive Outcome",
      label: "Interactive outcome / 交互成果",
    },
    {
      id: "fpVo-T5GLMI",
      title: "PoopSlaves — CAVE Dome Showcase",
      label: "CAVE dome showcase / 穹顶展示",
    },
  ],
  [
    {
      id: "IBD6i4xdrcI",
      title: "Final Video Installation: Plantiever’s Illusion",
      label: "Installation film / 装置影像",
    },
    {
      id: "My_lItiLHj4",
      title: "Plantiever’s Illusion — 3 minute version",
      label: "3-minute version / 3分钟版",
    },
    {
      id: "gG6JZPkrJ_g",
      title: "Plantiever’s Illusion — 5 minute version",
      label: "5-minute version / 5分钟版",
    },
  ],
  [],
  [
    {
      id: "tD2CHMm-ljE",
      title: "The Value Machine",
      label: "Installation demonstration / 装置演示",
    },
  ],
  [{ id: "fRwI4zcNDsA", title: "Fetorium 8K", label: "Final film / 最终影像" }],
  [
    {
      id: "fV_Jrce0Wlg",
      title: "Plated Fantasies",
      label: "Interactive installation / 互动装置",
    },
  ],
  [{ id: "7PBkRF7aY6c", title: "Closet X", label: "System film / 系统展示" }],
  [],
  [{ id: "bo7ichlhwmQ", title: "Feeding Fear", label: "Full film / 完整影像" }],
  [],
];
const publications = {
  0: {
    title:
      "Excremental Economy: A Rule-Based Speculative System for Staging Bodily Commodification and Unequal Value Extraction",
    meta: "Y. Chen, R. Du, G. Li · Creativity and Cognition 2026 · pp. 1622–1626",
    url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=yYgrzP8AAAAJ&citation_for_view=yYgrzP8AAAAJ:u-x6o8ySG0sC",
  },
  1: {
    title:
      "Unsettling the Auspicious Pine: A Digitally Mediated Moving-Image Installation for Reflective Reinterpretation",
    meta: "Y. Chen, M. Guo · Creativity and Cognition 2026 · pp. 1616–1621",
    url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=yYgrzP8AAAAJ&citation_for_view=yYgrzP8AAAAJ:u5HHmVD_uO8C",
  },
};
const poopPortfolioSeries = [
  "assets/poop-portfolio-01.jpg",
  "assets/poop-portfolio-02.jpg",
  "assets/poop-portfolio-03.png",
  "assets/poop-portfolio-04.png",
  "assets/poop-portfolio-05.png",
  "assets/poop-portfolio-06.png",
];
const plantieverPortfolioSeries = [
  "assets/plantiever-portfolio-01.jpg",
  "assets/plantiever-portfolio-02.jpg",
  "assets/plantiever-portfolio-03.jpg",
  "assets/plantiever-portfolio-04.jpg",
];
const valueMachinePortfolioSeries = [
  "assets/value-machine-portfolio-01.jpg",
  "assets/value-machine-portfolio-02.jpg",
  "assets/value-machine-portfolio-03.jpg",
  "assets/value-machine-portfolio-04.jpg",
  "assets/value-machine-portfolio-05.jpg",
];
const fetoriumPortfolioSeries = [
  "assets/fetorium-portfolio-01.jpg",
  "assets/fetorium-portfolio-02.jpg",
  "assets/fetorium-portfolio-03.jpg",
  "assets/fetorium-portfolio-04.jpg",
  "assets/fetorium-portfolio-05.jpg",
];
const platedFantasiesPortfolioSeries = [
  "assets/plated-fantasies-portfolio-01.jpg",
  "assets/plated-fantasies-portfolio-02.jpg",
  "assets/plated-fantasies-portfolio-03.jpg",
  "assets/plated-fantasies-portfolio-04.jpg",
];
const portfolioSeries = {
  PoopSlaves: poopPortfolioSeries,
  "Plantiever’s Illusion": plantieverPortfolioSeries,
  "Value Machine": valueMachinePortfolioSeries,
  Fetorium: fetoriumPortfolioSeries,
  "Plated Fantasies": platedFantasiesPortfolioSeries,
};

// Lead with Value Machine while keeping every project's parallel content aligned.
const displayOrder = [3, 0, 1, 2, 4, 5, 6, 7, 8, 9];
const reorder = (items) => displayOrder.map((index) => items[index]);
projects.splice(0, projects.length, ...reorder(projects));
caseCn.splice(0, caseCn.length, ...reorder(caseCn));
making.splice(0, making.length, ...reorder(making));
makingCn.splice(0, makingCn.length, ...reorder(makingCn));
projectTags.splice(0, projectTags.length, ...reorder(projectTags));
const originalVideos = [...projectVideos];
projectVideos.splice(0, projectVideos.length, ...reorder(originalVideos));
const originalPublications = { ...publications };
Object.keys(publications).forEach((key) => delete publications[key]);
displayOrder.forEach((originalIndex, newIndex) => {
  if (originalPublications[originalIndex])
    publications[newIndex] = originalPublications[originalIndex];
});
let current = 0,
  locked = false,
  wheelLock = false,
  currentView = "home";
const image = document.querySelector("#active-image"),
  title = document.querySelector("#active-title"),
  role = document.querySelector("#active-role"),
  num = document.querySelector("#active-no"),
  medium = document.querySelector("#active-medium"),
  activeTags = document.querySelector("#active-tags"),
  dots = document.querySelector("#dots"),
  list = document.querySelector("#project-list"),
  home = document.querySelector("#home"),
  work = document.querySelector("#work"),
  mosaic = document.querySelector("#portrait-mosaic"),
  shards = document.querySelector("#shards");
const cols = 8,
  rows = 6;
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const shard = document.createElement("span"),
      img = document.createElement("img");
    shard.className = "shard";
    const seed = r * cols + c,
      x = (c - (cols - 1) / 2) * (18 + (seed % 4) * 5),
      y = (r - (rows - 1) / 2) * (13 + (seed % 5) * 4);
    const clips = [
      "polygon(5% 2%,96% 8%,91% 94%,2% 88%)",
      "polygon(12% 0,100% 13%,88% 100%,0 82%)",
      "polygon(0 9%,92% 0,100% 86%,9% 100%)",
      "polygon(7% 0,100% 6%,94% 100%,0 91%)",
    ];
    shard.style.cssText = `left:${c * (100 / cols)}%;top:${r * (100 / rows)}%;width:${100 / cols + 0.35}%;height:${100 / rows + 0.35}%;clip-path:${clips[seed % clips.length]};transform:translate(${x}px,${y}px) rotate(${((seed * 7) % 17) - 8}deg) scale(.86);transition-delay:${seed * 18}ms`;
    img.src = "assets/yutong-bus.jpg";
    img.style.width = `${cols * 100}%`;
    img.style.height = `${rows * 100}%`;
    img.style.left = `-${c * 100}%`;
    img.style.top = `-${r * 100}%`;
    shard.append(img);
    shards.append(shard);
  }
}
setTimeout(() => mosaic.classList.add("assembled"), 120);
function enterWork() {
  if (currentView === "work") return;
  currentView = "work";
  closePanels();
  home.classList.add("exit");
  work.classList.add("active");
  work.setAttribute("aria-hidden", "false");
}
function returnHome() {
  currentView = "home";
  closePanels();
  home.classList.remove("exit");
  work.classList.remove("active");
  work.setAttribute("aria-hidden", "true");
  mosaic.classList.remove("assembled");
  setTimeout(() => mosaic.classList.add("assembled"), 80);
}
document.querySelector("#enter-work").onclick = enterWork;
document.querySelector("#home-work").onclick = () => {
  enterWork();
  setTimeout(() => document.querySelector('[data-open="index"]').click(), 700);
};
document.querySelector("#back-home").onclick = returnHome;
projects.forEach((p, i) => {
  const dot = document.createElement("button");
  dot.setAttribute("aria-label", `Open ${p.title}`);
  dot.onclick = () => show(i);
  dots.append(dot);
  const item = document.createElement("button");
  item.className = "project-item";
  item.innerHTML = `<img src="${p.image}" alt=""><span>${String(i + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}</span><strong>${p.title}</strong>`;
  item.onclick = () => {
    show(i);
    closePanels();
  };
  list.append(item);
});
let returnCategory = null;
function tagButtons(index, target) {
  target.innerHTML = projectTags[index]
    .map(
      (tag) => `<button class="tag-button" data-tag="${tag}">${tag}</button>`,
    )
    .join("");
  target.querySelectorAll("[data-tag]").forEach(
    (button) =>
      (button.onclick = (e) => {
        e.stopPropagation();
        openCategory(button.dataset.tag);
      }),
  );
}
function openCategory(tag) {
  closeNote(false);
  closePanels();
  returnCategory = tag;
  const panel = document.querySelector("#category-panel"),
    gallery = document.querySelector("#category-list");
  document.querySelector("#category-title").textContent =
    `${tag} Gallery / ${tag}`;
  document.querySelector("#category-lead").textContent =
    `Projects connected through ${tag}. Browse the archive, then open any full project without losing this collection.`;
  gallery.innerHTML = "";
  projects.forEach((p, i) => {
    if (!projectTags[i].includes(tag)) return;
    const item = document.createElement("button");
    item.className = "project-item";
    item.innerHTML = `<img src="${p.image}" alt=""><span>${String(i + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}</span><strong>${p.title}</strong><em>${projectTags[i].join(" · ")}</em>`;
    item.onclick = () => {
      show(i);
      closePanels();
      setTimeout(openNote, 300);
    };
    gallery.append(item);
  });
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
}
document.querySelector("#close-category").onclick = () => {
  returnCategory = null;
  closePanels();
};
tagButtons(0, activeTags);
function show(index) {
  if (locked) return;
  locked = true;
  current = (index + projects.length) % projects.length;
  image.classList.add("changing");
  title.classList.add("changing");
  role.classList.add("changing");
  setTimeout(() => {
    const p = projects[current];
    image.src = p.image;
    title.textContent = p.title;
    role.textContent = p.role;
    num.textContent = `${String(current + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
    medium.textContent = p.medium;
    tagButtons(current, activeTags);
    document
      .querySelectorAll(".dots button")
      .forEach((d, i) => d.classList.toggle("active", i === current));
    image.onload = () => {
      image.classList.remove("changing");
      title.classList.remove("changing");
      role.classList.remove("changing");
      locked = false;
    };
  }, 260);
}
const next = () => show(current + 1),
  prev = () => show(current - 1);
document.querySelector("#next-project")?.addEventListener("click", next);
document.querySelector("#next-project-small").onclick = next;
document.querySelector("#prev-project").onclick = prev;
document.querySelector("#note-next").onclick = () => {
  next();
  fillNote();
};
document.querySelector("#note-prev").onclick = () => {
  prev();
  fillNote();
};
addEventListener("keydown", (e) => {
  if (currentView === "home" && (e.key === "ArrowDown" || e.key === "Enter")) {
    enterWork();
    return;
  }
  if (
    currentView === "work" &&
    (e.key === "ArrowRight" || e.key === "ArrowDown")
  )
    next();
  if (currentView === "work" && (e.key === "ArrowLeft" || e.key === "ArrowUp"))
    prev();
  if (e.key === "Escape") {
    closePanels();
    closeNote();
  }
});
addEventListener(
  "wheel",
  (e) => {
    if (note.classList.contains("open") && note.contains(e.target)) return;
    if (wheelLock || Math.abs(e.deltaY) < 12) return;
    wheelLock = true;
    if (currentView === "home" && e.deltaY > 0) enterWork();
    else if (currentView === "work") e.deltaY > 0 ? next() : prev();
    setTimeout(() => (wheelLock = false), 900);
  },
  { passive: true },
);
function closePanels() {
  document.querySelectorAll(".panel").forEach((p) => {
    p.classList.remove("open");
    p.setAttribute("aria-hidden", "true");
  });
}
document.querySelectorAll("[data-open]").forEach(
  (b) =>
    (b.onclick = () => {
      closePanels();
      const p = document.querySelector(`[data-panel="${b.dataset.open}"]`);
      p.classList.add("open");
      p.setAttribute("aria-hidden", "false");
    }),
);
document
  .querySelectorAll("[data-close]")
  .forEach((b) => (b.onclick = closePanels));
const note = document.querySelector("#project-note");
function fillNote() {
  const p = projects[current];
  document.querySelector("#note-type").textContent = p.medium;
  document.querySelector("#note-title").textContent = p.title;
  document.querySelector("#note-copy").textContent = p.copy;
  document.querySelector("#note-cn").textContent = caseCn[current];
  tagButtons(current, document.querySelector("#case-tags"));
  document.querySelector("#case-count").textContent =
    `${String(current + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
  const sections = [
    [
      "01",
      "Research, direction & making",
      "调研、方向与制作",
      `The research was condensed into one clear design direction: ${p.role.toLowerCase()} ${making[current]}`,
      `前期调研、方向选择与制作过程被合并为一条连续叙事。以“${p.role.replace(".", "")}”作为核心形式。 ${makingCn[current]}`,
    ],
    ["02", "Final outcome", "最终成果", p.copy, caseCn[current]],
  ];
  document.querySelector("#case-sections").innerHTML = sections
    .map(
      (s, i) =>
        `<section class="case-section"><div class="case-label"><span>${s[0]}</span><h3>${s[1]}<small>${s[2]}</small></h3></div><div class="case-body"><p>${s[3]}</p><p class="case-cn">${s[4]}</p>${i === 1 ? `<img class="outcome-image" src="${p.image}" alt="${p.title} final outcome">` : ""}</div></section>`,
    )
    .join("");
  const container = document.querySelector("#case-sections"),
    videos = projectVideos[current],
    publication = publications[current];
  let sectionNumber = 3;
  const selectedPortfolioSeries = portfolioSeries[p.title];
  if (selectedPortfolioSeries) {
    container.insertAdjacentHTML(
      "beforeend",
      `<section class="portfolio-series"><header><span>03</span><div><h3>MA Application Portfolio Series</h3><p>硕士申请作品集系列套图 · Original full-resolution spreads</p></div><small>Drag or scroll horizontally / 左右滑动</small></header><div class="portfolio-rail">${selectedPortfolioSeries.map((src, i) => `<figure><img src="${src}" alt="${p.title} MA application portfolio spread ${i + 1}" loading="lazy"><figcaption>${String(i + 1).padStart(2, "0")} / ${String(selectedPortfolioSeries.length).padStart(2, "0")}</figcaption></figure>`).join("")}</div></section>`,
    );
    sectionNumber = 4;
  }
  if (videos.length) {
    container.insertAdjacentHTML(
      "beforeend",
      `<section class="case-section media-section"><div class="case-label"><span>${String(sectionNumber).padStart(2, "0")}</span><h3>Watch the work<small>观看作品</small></h3></div><div class="case-body"><p>Films, documentation and alternative presentations connected to this project.</p><p class="case-cn">点击预览图前往 YouTube 播放完整视频。</p><div class="video-gallery">${videos.map((v) => `<article class="video-card"><a class="video-preview" href="https://youtu.be/${v.id}" target="_blank" rel="noreferrer" aria-label="Play ${v.title} on YouTube"><img src="https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${v.id}/hqdefault.jpg'" alt="${v.title} video preview" loading="lazy"><span class="play-mark" aria-hidden="true">▶</span></a><div><strong>${v.title}</strong><span>${v.label}</span><a href="https://youtu.be/${v.id}" target="_blank" rel="noreferrer">Watch on YouTube ↗</a></div></article>`).join("")}</div></div></section>`,
    );
    sectionNumber += 1;
  }
  if (publication) {
    container.insertAdjacentHTML(
      "beforeend",
      `<section class="case-section publication-section"><div class="case-label"><span>${String(sectionNumber).padStart(2, "0")}</span><h3>Publication<small>相关论文</small></h3></div><div class="case-body"><p>${publication.title}</p><p class="case-cn">${publication.meta}</p><a class="paper-link" href="${publication.url}" target="_blank" rel="noreferrer">Read the paper on Google Scholar / 查看论文 ↗</a></div></section>`,
    );
  }
}
function openNote() {
  fillNote();
  note.classList.add("open");
  note.setAttribute("aria-hidden", "false");
  note.scrollTo(0, 0);
}
function closeNote(restore = true) {
  note.classList.remove("open");
  note.setAttribute("aria-hidden", "true");
  if (restore && returnCategory)
    setTimeout(() => openCategory(returnCategory), 250);
}
document.querySelector("#read-project").onclick = openNote;
document.querySelector("#close-note").onclick = closeNote;
const cursor = document.querySelector(".cursor");
addEventListener("pointermove", (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
  const px = e.clientX / innerWidth - 0.5,
    py = e.clientY / innerHeight - 0.5;
  if (currentView === "home") {
    mosaic.style.transform = `translate(${px * 15}px,${py * 12}px) rotateY(${px * 3}deg)`;
    document
      .querySelectorAll(".shard")
      .forEach(
        (s, i) =>
          (s.style.margin = `${py * ((i % rows) - 2.5) * 1.2}px 0 0 ${px * ((i % cols) - 3.5) * 1.2}px`),
      );
  } else
    image.style.transform = `scale(1.045) translate(${px * -1.1}%,${py * -1.1}%)`;
});
document.querySelectorAll("button,a").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursor.style.width = "2.4rem";
    cursor.style.height = "2.4rem";
  });
  el.addEventListener("mouseleave", () => {
    cursor.style.width = "1.1rem";
    cursor.style.height = "1.1rem";
  });
});
document.querySelector(".dots button")?.classList.add("active");
