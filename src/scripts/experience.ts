import { inView } from "motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./catalog";

gsap.registerPlugin(ScrollTrigger);
document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scenes = [...document.querySelectorAll<HTMLElement>(".sequence-scene")];
const sequence = document.querySelector<HTMLElement>(".war-sequence");
const frame = document.querySelector<HTMLElement>(".sequence-frame");
const sceneLinks = [...document.querySelectorAll<HTMLAnchorElement>("[data-scene-link]")];
const sceneProgress = document.querySelector<HTMLElement>(".sequence-progress-fill");

type VisualTreatment = {
  imageInset: string;
  scale: number;
  xPercent: number;
  yPercent: number;
  origin: string;
  copyFrom: { x: number; y: number; scale: number };
  copyExit: { x: number; y: number };
};

type ImageTweenFrame = {
  clipPath?: string;
  scale: number;
  xPercent: number;
  yPercent: number;
  rotation?: number;
  filter?: string;
  transformOrigin?: string;
};

type ImageMotion = {
  from: ImageTweenFrame;
  to: ImageTweenFrame;
};

const visualTreatments: Record<string, VisualTreatment> = {
  panorama: {
    imageInset: "inset(0 22% 0 0)",
    scale: 1.2,
    xPercent: -2,
    yPercent: 1,
    origin: "64% 48%",
    copyFrom: { x: 0, y: 32, scale: 0.98 },
    copyExit: { x: -18, y: -10 },
  },
  breach: {
    imageInset: "inset(0 0 0 100%)",
    scale: 1.17,
    xPercent: 2,
    yPercent: 0,
    origin: "38% 50%",
    copyFrom: { x: 44, y: 0, scale: 1 },
    copyExit: { x: -30, y: 0 },
  },
  formation: {
    imageInset: "inset(18% 0 0 0)",
    scale: 1.13,
    xPercent: 0,
    yPercent: 2,
    origin: "50% 42%",
    copyFrom: { x: -34, y: 10, scale: 1 },
    copyExit: { x: 0, y: -22 },
  },
  armory: {
    imageInset: "inset(0 0 0 76%)",
    scale: 1.12,
    xPercent: -1,
    yPercent: 0,
    origin: "70% 50%",
    copyFrom: { x: -26, y: 0, scale: 0.98 },
    copyExit: { x: 0, y: -16 },
  },
  ashfall: {
    imageInset: "inset(0 0 78% 0)",
    scale: 1.18,
    xPercent: 1,
    yPercent: -1,
    origin: "46% 63%",
    copyFrom: { x: 0, y: -32, scale: 1.02 },
    copyExit: { x: 18, y: -8 },
  },
  "last-stand": {
    imageInset: "inset(0 18% 0 18%)",
    scale: 1.11,
    xPercent: 0,
    yPercent: 0,
    origin: "50% 50%",
    copyFrom: { x: 0, y: 24, scale: 0.94 },
    copyExit: { x: 0, y: -18 },
  },
  command: {
    imageInset: "inset(0 25% 0 0)",
    scale: 1.15,
    xPercent: -1.5,
    yPercent: 0,
    origin: "62% 45%",
    copyFrom: { x: -36, y: 0, scale: 1 },
    copyExit: { x: -20, y: 0 },
  },
  brotherhood: {
    imageInset: "inset(0 0 0 70%)",
    scale: 1.14,
    xPercent: 1.5,
    yPercent: 0,
    origin: "72% 48%",
    copyFrom: { x: 36, y: 0, scale: 1 },
    copyExit: { x: 0, y: -20 },
  },
  thrashball: {
    imageInset: "inset(15% 0 0 0)",
    scale: 1.13,
    xPercent: 0,
    yPercent: 1.5,
    origin: "51% 40%",
    copyFrom: { x: 0, y: 28, scale: 0.97 },
    copyExit: { x: -14, y: -8 },
  },
  tactician: {
    imageInset: "inset(0 0 0 74%)",
    scale: 1.12,
    xPercent: -1,
    yPercent: 0,
    origin: "77% 50%",
    copyFrom: { x: -40, y: 0, scale: 1 },
    copyExit: { x: 18, y: 0 },
  },
  "command-comms": {
    imageInset: "inset(0 0 74% 0)",
    scale: 1.16,
    xPercent: 0,
    yPercent: -1,
    origin: "50% 64%",
    copyFrom: { x: 0, y: -26, scale: 1.02 },
    copyExit: { x: 0, y: -14 },
  },
  horde: {
    imageInset: "inset(0 20% 0 20%)",
    scale: 1.2,
    xPercent: 0,
    yPercent: 0,
    origin: "50% 50%",
    copyFrom: { x: 30, y: 8, scale: 0.96 },
    copyExit: { x: 28, y: 0 },
  },
};

const getVisualTreatment = (element: HTMLElement) =>
  visualTreatments[element.dataset.visual ?? ""] ?? visualTreatments.panorama;

const imageMotions: Record<string, ImageMotion> = {
  panorama: {
    from: { clipPath: "inset(0 28% 0 0)", scale: 1.18, xPercent: -2, yPercent: 1 },
    to: { clipPath: "inset(0 0 0 0)", scale: 1.025, xPercent: 0, yPercent: 0 },
  },
  breach: {
    from: {
      clipPath: "inset(0 0 0 100%)",
      scale: 1.1,
      xPercent: 3,
      yPercent: 0,
    },
    to: {
      clipPath: "inset(0 0 0 0)",
      scale: 1.025,
      xPercent: 0,
      yPercent: 0,
    },
  },
  formation: {
    from: { clipPath: "inset(100% 0 0 0)", scale: 1.12, xPercent: 0, yPercent: 4 },
    to: { clipPath: "inset(0 0 0 0)", scale: 1.025, xPercent: 0, yPercent: 0 },
  },
  containment: {
    from: {
      clipPath: "circle(0% at 72% 50%)",
      scale: 1.12,
      xPercent: -1,
      yPercent: 0,
      transformOrigin: "72% 50%",
    },
    to: {
      clipPath: "circle(140% at 72% 50%)",
      scale: 1.025,
      xPercent: 0,
      yPercent: 0,
    },
  },
  armory: {
    from: {
      clipPath: "circle(0% at 70% 46%)",
      scale: 1.12,
      xPercent: -1,
      yPercent: 0,
      transformOrigin: "70% 46%",
    },
    to: {
      clipPath: "circle(120% at 70% 46%)",
      scale: 1.025,
      xPercent: 0,
      yPercent: 0,
    },
  },
  ashfall: {
    from: {
      scale: 1.14,
      xPercent: 1,
      yPercent: -1,
      filter: "blur(12px) brightness(0.56)",
    },
    to: { scale: 1.025, xPercent: 0, yPercent: 0, filter: "blur(0px) brightness(1)" },
  },
  "last-stand": {
    from: { clipPath: "inset(0 0 100% 0)", scale: 1.1, xPercent: 0, yPercent: -2 },
    to: { clipPath: "inset(0 0 0 0)", scale: 1.025, xPercent: 0, yPercent: 0 },
  },
  command: {
    from: {
      clipPath: "inset(0 0 0 100%)",
      scale: 1.14,
      xPercent: 2,
      yPercent: 0,
      transformOrigin: "62% 45%",
    },
    to: { clipPath: "inset(0 0 0 0)", scale: 1.025, xPercent: 0, yPercent: 0 },
  },
  brotherhood: {
    from: {
      scale: 1.34,
      xPercent: 5,
      yPercent: 3,
      filter: "saturate(0.62) brightness(0.74)",
    },
    to: { scale: 1.04, xPercent: -2, yPercent: -1, filter: "saturate(0.88) brightness(1)" },
  },
  thrashball: {
    from: {
      clipPath: "circle(0% at 18% 62%)",
      scale: 1.12,
      xPercent: 0,
      yPercent: 1,
      transformOrigin: "18% 62%",
    },
    to: {
      clipPath: "circle(135% at 18% 62%)",
      scale: 1.025,
      xPercent: 0,
      yPercent: 0,
    },
  },
  tactician: {
    from: {
      clipPath: "polygon(0 0, 100% 0, 0 0, 0 100%)",
      scale: 1.13,
      xPercent: -1,
      yPercent: 0,
    },
    to: {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      scale: 1.025,
      xPercent: 0,
      yPercent: 0,
    },
  },
  "command-comms": {
    from: {
      clipPath: "ellipse(0% 50% at 50% 50%)",
      scale: 1.08,
      xPercent: 0,
      yPercent: 0,
      filter: "brightness(0.68) saturate(0.58)",
    },
    to: {
      clipPath: "ellipse(100% 100% at 50% 50%)",
      scale: 1.025,
      xPercent: 0,
      yPercent: 0,
      filter: "brightness(1) saturate(0.88)",
    },
  },
  horde: {
    from: {
      clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
      scale: 1.2,
      xPercent: -2,
      yPercent: 0,
    },
    to: {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      scale: 1.025,
      xPercent: 0,
      yPercent: 0,
    },
  },
};

const getImageMotion = (element: HTMLElement, treatment: VisualTreatment): ImageMotion =>
  imageMotions[element.dataset.visual ?? ""] ?? {
    from: {
      clipPath: treatment.imageInset,
      scale: treatment.scale,
      xPercent: treatment.xPercent,
      yPercent: treatment.yPercent,
      transformOrigin: treatment.origin,
    },
    to: { clipPath: "inset(0 0 0 0)", scale: 1.025, xPercent: 0, yPercent: 0 },
  };

const setActiveScene = (index: number, hideInactive = true) => {
  scenes.forEach((scene, sceneIndex) => {
    if (hideInactive) {
      scene.setAttribute("aria-hidden", String(sceneIndex !== index));
    } else {
      scene.removeAttribute("aria-hidden");
    }
  });

  sceneLinks.forEach((link, linkIndex) => {
    if (linkIndex === index) {
      link.setAttribute("aria-current", "step");
    } else {
      link.removeAttribute("aria-current");
    }
  });

};

const refreshScrollPositions = () => {
  if (document.readyState === "complete") {
    ScrollTrigger.refresh();
  } else {
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  }
};

const splitKineticHeading = (heading: HTMLElement) => {
  if (heading.dataset.kineticSplit === "true") return;

  heading.dataset.kineticSplit = "true";
  heading.setAttribute("aria-label", heading.textContent?.replace(/\s+/gu, " ").trim() ?? "");
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    if (walker.currentNode.textContent?.trim()) {
      textNodes.push(walker.currentNode as Text);
    }
  }

  textNodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    const segments = textNode.textContent?.match(/\s+|[^\s]+/gu) ?? [];

    segments.forEach((segment) => {
      if (/^\s+$/u.test(segment)) {
        fragment.append(document.createTextNode(segment));
        return;
      }

      const word = document.createElement("span");
      word.className = "kinetic-word";
      word.setAttribute("aria-hidden", "true");
      Array.from(segment).forEach((character) => {
        const letter = document.createElement("span");
        letter.className = "kinetic-char";
        letter.textContent = character;
        word.append(letter);
      });
      fragment.append(word);
    });

    textNode.replaceWith(fragment);
  });
};

const kineticHeadings = [
  ...document.querySelectorAll<HTMLElement>(
    ".hero h1, .sequence-scene h2, .editorial-heading h2, .editorial-panel h3, .arsenal-copy h2, .aftermath h2",
  ),
];
kineticHeadings.forEach(splitKineticHeading);

const sceneTitleReveals: Record<string, { from: gsap.TweenVars; to: string; duration: number }> = {
  panorama: {
    from: { clipPath: "inset(0 100% 0 0)", xPercent: -4, filter: "brightness(0.55)" },
    to: "inset(0 0 0 0)",
    duration: 0.42,
  },
  breach: {
    from: {
      clipPath: "inset(0 0 0 100%)",
      xPercent: 3,
    },
    to: "inset(0 0 0 0)",
    duration: 0.36,
  },
  formation: {
    from: { clipPath: "inset(100% 0 0 0)", yPercent: 12 },
    to: "inset(0 0 0 0)",
    duration: 0.4,
  },
  containment: {
    from: { clipPath: "circle(0% at 72% 50%)", scale: 1.06 },
    to: "circle(140% at 72% 50%)",
    duration: 0.46,
  },
  ashfall: {
    from: {
      clipPath: "polygon(0 0, 100% 0, 72% 100%, 0 100%)",
      xPercent: -3,
    },
    to: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
    duration: 0.4,
  },
  "last-stand": {
    from: { clipPath: "inset(0 0 100% 0)", yPercent: -10, filter: "blur(8px)" },
    to: "inset(0 0 0 0)",
    duration: 0.48,
  },
};

const editorialTitleMasks: Record<string, string> = {
  command: "inset(0 100% 0 0)",
  brotherhood: "polygon(0 0, 100% 0, 72% 100%, 0 100%)",
  horde: "inset(100% 0 0 0)",
};

let viewportRefreshTimer = 0;
window.addEventListener(
  "resize",
  () => {
    window.clearTimeout(viewportRefreshTimer);
    viewportRefreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 180);
  },
  { passive: true },
);

if (reducedMotion) {
  document.querySelectorAll<HTMLElement>(".reveal").forEach((element) => {
    element.classList.add("is-visible");
  });
} else {
  for (const element of document.querySelectorAll<HTMLElement>(".reveal")) {
    inView(
      element,
      () => {
        element.classList.add("is-visible");
        return () => element.classList.remove("is-visible");
      },
      { margin: "0px 0px -70px 0px" },
    );
  }

  document
    .querySelectorAll<HTMLElement>(
      ".editorial-heading h2, .arsenal-copy h2, .aftermath h2",
    )
    .forEach((heading, index) => {
      const revealFrames = [
        { clipPath: "inset(0 0 100% 0)", y: 24 },
        { clipPath: "inset(0 100% 0 0)", x: -24 },
        { clipPath: "polygon(0 0, 100% 0, 72% 100%, 0 100%)", y: 0 },
      ];
      const frame = revealFrames[index % revealFrames.length];
      gsap.fromTo(
        heading,
        frame,
        {
          clipPath: "inset(0)",
          x: 0,
          y: 0,
          duration: 0.82,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heading,
            start: "top 82%",
            once: true,
          },
        },
      );
    });

  const heroReveal = gsap.timeline({ delay: 0.12 });
  heroReveal.fromTo(
    ".hero-art > img",
    { clipPath: "inset(0 28% 0 0)", scale: 1.14, xPercent: -1.5 },
    {
      clipPath: "inset(0 0 0 0)",
      scale: 1.04,
      xPercent: 0,
      duration: 1.2,
      ease: "power2.out",
    },
    0,
  );
  heroReveal.fromTo(
    ".hero .eyebrow",
    { autoAlpha: 0, x: -20 },
    { autoAlpha: 1, x: 0, duration: 0.6, ease: "power3.out" },
    0.06,
  );
  const heroTitleCharacters = document.querySelectorAll<HTMLElement>(".hero h1 .kinetic-char");
  heroReveal.fromTo(
    heroTitleCharacters,
    { autoAlpha: 0, yPercent: 115, rotateX: -18, filter: "blur(5px)" },
    {
      autoAlpha: 1,
      yPercent: 0,
      rotateX: 0,
      filter: "blur(0px)",
      duration: 0.56,
      stagger: 0.018,
      ease: "power3.out",
    },
    0.16,
  );
  heroReveal.fromTo(
    [".hero-detail", ".hero-actions", ".hero-stamp"],
    { autoAlpha: 0, y: 20 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: "power3.out",
    },
    0.46,
  );

  const hero = document.querySelector<HTMLElement>(".hero");
  if (hero) {
    gsap.to(".hero-art > img", {
      scale: 1.16,
      xPercent: -2.4,
      yPercent: 1.5,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 0.55,
      },
    });
    gsap.to(".hero-copy", {
      yPercent: -9,
      autoAlpha: 0.3,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 0.55,
      },
    });
  }

  gsap.to(".page-progress-fill", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
  });

  const arsenal = document.querySelector<HTMLElement>(".arsenal-section");
  if (arsenal) {
    gsap.fromTo(
      ".arsenal-art img",
      { scale: 1.16, xPercent: 2 },
      {
        scale: 1.03,
        xPercent: -1,
        ease: "none",
        scrollTrigger: {
          trigger: arsenal,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.7,
        },
      },
    );
  }

  const finale = document.querySelector<HTMLElement>(".aftermath");
  if (finale) {
    gsap.fromTo(
      ".aftermath-art",
      { scale: 1.12, yPercent: -3 },
      {
        scale: 1.04,
        yPercent: 4,
        ease: "none",
        scrollTrigger: {
          trigger: finale,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      },
    );
  }
}

const primaryNavLinks = [
  ...document.querySelectorAll<HTMLAnchorElement>(
    '.desktop-nav a[href^="#"], .mobile-menu nav a[href^="#"]',
  ),
];
const navSectionIds = [...new Set(primaryNavLinks.map((link) => link.hash.slice(1)))];
const navSections = navSectionIds
  .map((sectionId) => document.getElementById(sectionId))
  .filter((section): section is HTMLElement => section instanceof HTMLElement);
const updatePrimaryNavigation = () => {
  const activeLine = Math.min(window.innerHeight * 0.35, 190);
  const activeSection = navSections.find((section) => {
    const bounds = section.getBoundingClientRect();
    return bounds.top <= activeLine && bounds.bottom > activeLine;
  });

  primaryNavLinks.forEach((link) => {
    if (activeSection && link.hash === `#${activeSection.id}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });

};

let navigationUpdateFrame = 0;
const schedulePrimaryNavigationUpdate = () => {
  if (navigationUpdateFrame) return;
  navigationUpdateFrame = window.requestAnimationFrame(() => {
    navigationUpdateFrame = 0;
    updatePrimaryNavigation();
  });
};

window.addEventListener("scroll", schedulePrimaryNavigationUpdate, { passive: true });
window.addEventListener("resize", schedulePrimaryNavigationUpdate, { passive: true });
ScrollTrigger.addEventListener("refresh", schedulePrimaryNavigationUpdate);
updatePrimaryNavigation();

const media = gsap.matchMedia();

if (!reducedMotion && sequence && frame && scenes.length > 0) {
  media.add("(min-width: 761px) and (prefers-reduced-motion: no-preference)", () => {
    setActiveScene(0);
    gsap.set(scenes, { autoAlpha: 0 });
    gsap.set(scenes[0], { autoAlpha: 1 });
    scenes.forEach((scene) => {
      gsap.set(scene.querySelector(".scene-copy"), { autoAlpha: 0, y: 24 });
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        id: "gears-campaign-sequence",
        trigger: sequence,
        pin: frame,
        start: "top top",
        end: () => `+=${window.innerHeight * scenes.length * 0.82}`,
        scrub: 0.65,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) =>
          setActiveScene(Math.min(scenes.length - 1, Math.floor(self.progress * scenes.length))),
      },
    });

    scenes.forEach((scene, index) => {
      const image = scene.querySelector(".scene-image");
      const copy = scene.querySelector(".scene-copy");
      const title = scene.querySelector<HTMLElement>(".scene-copy h2");
      const treatment = getVisualTreatment(scene);

      if (image) {
        const motion = getImageMotion(scene, treatment);
        // Keep campaign art visible throughout the scrub; the title carries the reveal.
        timeline.fromTo(
          image,
          { ...motion.from, clipPath: "inset(0)" },
          {
            ...motion.to,
            clipPath: "inset(0)",
            duration: 1,
            ease: "none",
          },
          index,
        );
      }

      if (copy) {
        timeline.fromTo(
          copy,
          { autoAlpha: 0, ...treatment.copyFrom },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.25,
            ease: "power2.out",
          },
          index + 0.04,
        );

        if (index < scenes.length - 1) {
          timeline.to(
            copy,
            { autoAlpha: 0, ...treatment.copyExit, duration: 0.18, ease: "power1.in" },
            index + 0.82,
          );
        }
      }

      if (title) {
        const reveal = sceneTitleReveals[scene.dataset.visual ?? "panorama"];
        timeline.fromTo(
          title,
          reveal.from,
          {
            clipPath: reveal.to,
            xPercent: 0,
            yPercent: 0,
            scale: 1,
            filter: "blur(0px) brightness(1)",
            duration: reveal.duration,
            ease: "power3.out",
          },
          index + 0.12,
        );
      }

      if (index < scenes.length - 1) {
        timeline.to(scene, { autoAlpha: 0, duration: 0.18, ease: "none" }, index + 0.82);
        timeline.fromTo(
          scenes[index + 1],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.18, ease: "none" },
          index + 0.82,
        );
      }
    });

    if (sceneProgress) {
      timeline.to(sceneProgress, { scaleY: 1, duration: scenes.length, ease: "none" }, 0);
    }

    const handleSceneLink = (event: MouseEvent) => {
      const link = event.currentTarget;
      if (!(link instanceof HTMLAnchorElement)) return;

      const linkIndex = sceneLinks.indexOf(link);
      const index = linkIndex;
      const trigger = timeline.scrollTrigger;

      if (index < 0 || !trigger) return;

      event.preventDefault();
      const progress = (index + 0.5) / scenes.length;
      window.scrollTo({
        top: trigger.start + (trigger.end - trigger.start) * progress,
        behavior: "smooth",
      });
    };

    const sceneJumpLinks = sceneLinks;

    sceneJumpLinks.forEach((link) => {
      link.addEventListener("click", handleSceneLink);
    });

    refreshScrollPositions();

    return () => {
      sceneJumpLinks.forEach((link) => {
        link.removeEventListener("click", handleSceneLink);
      });
    };
  });

  media.add("(max-width: 760px) and (prefers-reduced-motion: no-preference)", () => {
    setActiveScene(0, false);
    scenes.forEach((scene, index) => {
      const copy = scene.querySelector(".scene-copy");
      const title = scene.querySelector<HTMLElement>(".scene-copy h2");
      if (copy) {
        gsap.fromTo(
          copy,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
            ease: "power2.out",
            scrollTrigger: {
              trigger: scene,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      if (title) {
        const reveal = sceneTitleReveals[scene.dataset.visual ?? "panorama"];
        gsap.fromTo(
          title,
          reveal.from,
          {
            clipPath: reveal.to,
            xPercent: 0,
            yPercent: 0,
            scale: 1,
            filter: "blur(0px) brightness(1)",
            duration: reveal.duration,
            ease: "power3.out",
            scrollTrigger: {
              trigger: scene,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      ScrollTrigger.create({
        trigger: scene,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) setActiveScene(index, false);
        },
      });
    });

    refreshScrollPositions();
  });
}

type EditorialSequenceOptions = {
  track: HTMLElement;
  stage: HTMLElement;
  slides: HTMLElement[];
  links: HTMLAnchorElement[];
};

const setupEditorialSequence = ({
  track,
  stage,
  slides,
  links,
}: EditorialSequenceOptions) => {
  const setActive = (index: number, hideInactive: boolean) => {
    slides.forEach((slide, slideIndex) => {
      if (hideInactive) {
        slide.setAttribute("aria-hidden", String(slideIndex !== index));
      } else {
        slide.removeAttribute("aria-hidden");
      }
    });

    links.forEach((link, linkIndex) => {
      if (linkIndex === index) {
        link.setAttribute("aria-current", "step");
      } else {
        link.removeAttribute("aria-current");
      }
    });

  };

  if (reducedMotion) {
    setActive(0, false);
    const navigateWithoutMotion = (event: MouseEvent) => {
      const link = event.currentTarget;
      if (!(link instanceof HTMLAnchorElement)) return;
      const index = links.indexOf(link);
      const target = slides[index];
      if (!target) return;

      event.preventDefault();
      setActive(index, false);
      target.scrollIntoView({ behavior: "auto", block: "start" });
    };

    links.forEach((link) => link.addEventListener("click", navigateWithoutMotion));
    return {
      revert: () => {
        links.forEach((link) => link.removeEventListener("click", navigateWithoutMotion));
      },
    };
  }

  const editorialMedia = gsap.matchMedia();
  editorialMedia.add(
    "(min-width: 761px) and (prefers-reduced-motion: no-preference)",
    () => {
      const isCharacterSequence = track.closest(".character-section") !== null;
      const characterOutroDuration = 0.5;
      setActive(0, true);
      gsap.set(slides, {
        autoAlpha: isCharacterSequence ? 1 : 0,
        ...(isCharacterSequence ? { position: "relative", width: "100vw", flex: "0 0 100vw" } : {}),
      });
      gsap.set(slides[0], { autoAlpha: 1 });
      slides.forEach((slide, index) => {
        gsap.set(slide.querySelector(".editorial-copy"), {
          autoAlpha: index === 0 ? 1 : 0,
          x: index === 0 ? 0 : isCharacterSequence && index % 2 === 0 ? 32 : -32,
          y: index === 0 || isCharacterSequence ? 0 : 28,
        });
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          pin: stage,
          start: "top top",
          end: () =>
            `+=${(isCharacterSequence ? window.innerWidth : window.innerHeight) * (slides.length - 1)}`,
          scrub: isCharacterSequence ? 0.72 : 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const sequencePosition = self.progress * (slides.length - 1);
            const index = isCharacterSequence
              ? Math.min(slides.length - 1, Math.round(sequencePosition))
              : Math.min(
                  slides.length - 1,
                  Math.max(0, Math.floor(sequencePosition - 0.91 + 1)),
                );
            setActive(index, true);
          },
        },
      });

      if (isCharacterSequence) {
        const nextSectionHeading = track
          .closest(".character-section")
          ?.nextElementSibling?.querySelector<HTMLElement>(".editorial-heading");
        if (nextSectionHeading) {
          timeline.set(nextSectionHeading, { opacity: 0 }, 0);
          timeline.set(nextSectionHeading, { opacity: 1 }, slides.length - 1);
        }

        gsap.set(stage, { display: "flex", width: `${slides.length * 100}vw` });
        const sectionOverlays = stage.querySelectorAll<HTMLElement>(
          ".editorial-nav, .editorial-hint",
        );
        timeline.to(
          stage,
          {
            x: () => -window.innerWidth * (slides.length - 1),
            duration: slides.length - 1 - characterOutroDuration,
            ease: "none",
          },
          0,
        );
        timeline.to(
          sectionOverlays,
          {
            x: () => window.innerWidth * (slides.length - 1),
            duration: slides.length - 1,
            ease: "none",
          },
          0,
        );

        slides.forEach((slide, index) => {
          const image = slide.querySelector(".editorial-image");
          const copy = slide.querySelector(".editorial-copy");
          const title = slide.querySelector<HTMLElement>("h3");

          if (image) {
            timeline.fromTo(
              image,
              { scale: 1.12, xPercent: 3 },
              { scale: 1.04, xPercent: -2, duration: 1, ease: "none" },
              Math.min(index, slides.length - 2),
            );
          }

          if (copy && index > 0) {
            const enterAt =
              isCharacterSequence && index === slides.length - 1 ? index - 1 : index - 0.42;
            timeline.fromTo(
              copy,
              { autoAlpha: 0, x: index % 2 === 0 ? 32 : -32 },
              { autoAlpha: 1, x: 0, duration: 0.24, ease: "power2.out" },
              enterAt,
            );
          }

          if (copy && index < slides.length - 1) {
            timeline.to(
              copy,
              { autoAlpha: 0, x: index % 2 === 0 ? -18 : 18, duration: 0.18, ease: "power1.in" },
              index + 0.82,
            );
          }

          if (title) {
            const characters = title.querySelectorAll<HTMLElement>(".kinetic-char");
            const titleStart = index === 0 ? 0.08 : index - 0.36;
            timeline.fromTo(
              characters,
              { autoAlpha: 0, yPercent: 90, rotateX: -12 },
              {
                autoAlpha: 1,
                yPercent: 0,
                rotateX: 0,
                duration: 0.2,
                stagger: 0.004,
                ease: "power3.out",
              },
              titleStart,
            );
          }
        });
      } else {
        slides.forEach((slide, index) => {
          const image = slide.querySelector(".editorial-image");
          const copy = slide.querySelector(".editorial-copy");
          const title = slide.querySelector<HTMLElement>("h3");
          const treatment = getVisualTreatment(slide);

          if (image) {
            const isLastSlide = index === slides.length - 1;
            const motion = getImageMotion(slide, treatment);
            timeline.fromTo(
              image,
              motion.from,
              {
                ...motion.to,
                duration: isLastSlide ? 0.18 : 1,
                ease: "none",
              },
              isLastSlide ? index - 1 + 0.82 : index,
            );
          }

          if (index === 0 && copy) {
            timeline.fromTo(
              copy,
              { autoAlpha: 0, ...treatment.copyFrom },
              {
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.28,
                ease: "power2.out",
              },
              0.04,
            );
          }

          if (index > 0) {
            const transitionAt = index - 1 + 0.82;
            const previous = slides[index - 1];
            const previousCopy = previous.querySelector(".editorial-copy");
            const previousTreatment = getVisualTreatment(previous);

            if (previousCopy) {
              timeline.to(
                previousCopy,
                {
                  autoAlpha: 0,
                  ...previousTreatment.copyExit,
                  duration: 0.17,
                  ease: "power1.in",
                },
                transitionAt,
              );
            }

            timeline.to(previous, { autoAlpha: 0, duration: 0.17, ease: "none" }, transitionAt);
            timeline.fromTo(
              slide,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.17, ease: "none" },
              transitionAt,
            );

            if (copy) {
              timeline.fromTo(
                copy,
                { autoAlpha: 0, ...treatment.copyFrom },
                {
                  autoAlpha: 1,
                  x: 0,
                  y: 0,
                  scale: 1,
                  duration: index === slides.length - 1 ? 0.16 : 0.24,
                  ease: "power2.out",
                },
                transitionAt + 0.02,
              );
            }
          }

          if (title) {
            const titleStart = index === 0 ? 0.04 : index - 1 + 0.84;
            timeline.fromTo(
              title,
              { clipPath: editorialTitleMasks[slide.dataset.visual ?? ""] ?? "inset(100% 0 0 0)" },
              {
                clipPath: "inset(0)",
                duration: 0.22,
                ease: "power3.out",
              },
              titleStart,
            );
          }
        });
      }

      const navigateToSlide = (event: MouseEvent) => {
        const link = event.currentTarget;
        if (!(link instanceof HTMLAnchorElement)) return;
        const index = links.indexOf(link);
        const trigger = timeline.scrollTrigger;
        if (index < 0 || !trigger) return;

        event.preventDefault();
        const progress =
          isCharacterSequence && index === slides.length - 1
          ? (slides.length - 1 - characterOutroDuration) / (slides.length - 1)
            : index / (slides.length - 1);
        window.scrollTo({
          top: trigger.start + (trigger.end - trigger.start) * progress,
          behavior: "smooth",
        });
      };

      links.forEach((link) => link.addEventListener("click", navigateToSlide));
      refreshScrollPositions();

      return () => {
        links.forEach((link) => link.removeEventListener("click", navigateToSlide));
      };
    },
  );

  editorialMedia.add(
    "(max-width: 760px) and (prefers-reduced-motion: no-preference)",
    () => {
      const isCharacterSequence = track.closest(".character-section") !== null;
      setActive(0, false);
      slides.forEach((slide, index) => {
        const copy = slide.querySelector(".editorial-copy");
        const title = slide.querySelector<HTMLElement>("h3");
        if (copy) {
          gsap.fromTo(
            copy,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.65,
              ease: "power2.out",
              scrollTrigger: {
                trigger: slide,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }

        if (title) {
          if (isCharacterSequence) {
            gsap.fromTo(
              title.querySelectorAll<HTMLElement>(".kinetic-char"),
              { autoAlpha: 0, yPercent: 75 },
              {
                autoAlpha: 1,
                yPercent: 0,
                duration: 0.38,
                stagger: 0.008,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: slide,
                  start: "top 70%",
                  toggleActions: "play none none reverse",
                },
              },
            );
          } else {
            gsap.fromTo(
              title,
              {
                clipPath:
                  editorialTitleMasks[slide.dataset.visual ?? ""] ?? "inset(100% 0 0 0)",
              },
              {
                clipPath: "inset(0)",
                duration: 0.46,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: slide,
                  start: "top 70%",
                  toggleActions: "play none none reverse",
                },
              },
            );
          }
        }

        ScrollTrigger.create({
          trigger: slide,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) setActive(index, false);
          },
        });
      });

      const navigateToSlide = (event: MouseEvent) => {
        const link = event.currentTarget;
        if (!(link instanceof HTMLAnchorElement)) return;
        const index = links.indexOf(link);
        const target = slides[index];
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      };

      links.forEach((link) => link.addEventListener("click", navigateToSlide));
      refreshScrollPositions();

      return () => {
        links.forEach((link) => link.removeEventListener("click", navigateToSlide));
      };
    },
  );

  return editorialMedia;
};

const initializeEditorialSequence = (root: ParentNode) => {
  const track = root.querySelector<HTMLElement>("[data-editorial-track]");
  const stage = root.querySelector<HTMLElement>("[data-editorial-stage]");
  const slides = [...root.querySelectorAll<HTMLElement>("[data-editorial-slide]")];
  const links = [...root.querySelectorAll<HTMLAnchorElement>("[data-editorial-link]")];

  if (!track || !stage || slides.length === 0 || links.length !== slides.length) return null;

  return setupEditorialSequence({
    track,
    stage,
    slides,
    links,
  });
};

const characterSection = document.querySelector<HTMLElement>(".character-section");
if (characterSection) {
  initializeEditorialSequence(characterSection);
}

const mobileMenu = document.querySelector<HTMLDetailsElement>(".mobile-menu");
const mobileMenuSummary = mobileMenu?.querySelector<HTMLElement>("summary");

mobileMenu?.addEventListener("toggle", () => {
  const isOpen = mobileMenu.open;
  mobileMenuSummary?.setAttribute("aria-expanded", String(isOpen));
  mobileMenuSummary?.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  if (isOpen) {
    window.requestAnimationFrame(() => {
      mobileMenu.querySelector<HTMLAnchorElement>("nav a")?.focus();
    });
  }
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.open = false;
    mobileMenuSummary?.focus();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileMenu?.open) {
    mobileMenu.open = false;
    mobileMenuSummary?.focus();
  }
});

document.addEventListener("pointerdown", (event) => {
  if (mobileMenu?.open && event.target instanceof Node && !mobileMenu.contains(event.target)) {
    mobileMenu.open = false;
  }
});

document.querySelectorAll<HTMLImageElement>(".hero-art img, .scene-image").forEach((image) => {
  image.addEventListener(
    "error",
    () => {
      console.error(`No se pudo cargar la imagen de campaña: ${image.currentSrc || image.src}`);
    },
    { once: true },
  );
});

const atmosphereCanvases = [
  ...document.querySelectorAll<HTMLCanvasElement>("[data-atmosphere]"),
];

if (atmosphereCanvases.length > 0) {
  const startAtmospheres = async () => {
    let createAtmosphere: typeof import("./atmosphere").createAtmosphere;
    try {
      ({ createAtmosphere } = await import("./atmosphere"));
    } catch (error) {
      atmosphereCanvases.forEach((canvas) => {
        canvas.hidden = true;
      });
      console.error("No se pudo cargar el motor local de partículas.", error);
      return;
    }

    const initializeAtmosphere = (canvas: HTMLCanvasElement) => {
      try {
        const host = canvas.parentElement;
        if (!host) {
          throw new Error("El campo de partículas necesita un contenedor local.");
        }
        createAtmosphere(
          canvas,
          () => {
            const bounds = host.getBoundingClientRect();
            return Math.max(
              0,
              Math.min(1, -bounds.top / Math.max(bounds.height - window.innerHeight, 1)),
            );
          },
          !reducedMotion,
        );
      } catch (error) {
        canvas.hidden = true;
        console.error(`No se pudo iniciar el campo local "${canvas.dataset.atmosphere}".`, error);
      }
    };

    const atmosphereObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || !(entry.target instanceof HTMLCanvasElement)) return;
          atmosphereObserver.unobserve(entry.target);
          initializeAtmosphere(entry.target);
        });
      },
      { rootMargin: "180px" },
    );
    atmosphereCanvases.forEach((canvas) => atmosphereObserver.observe(canvas));
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => void startAtmospheres(), { timeout: 1800 });
  } else {
    window.setTimeout(() => void startAtmospheres(), 450);
  }
}
