import { inView } from "motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scenes = [...document.querySelectorAll<HTMLElement>(".sequence-scene")];
const sequence = document.querySelector<HTMLElement>(".war-sequence");
const frame = document.querySelector<HTMLElement>(".sequence-frame");
const sceneLinks = [...document.querySelectorAll<HTMLAnchorElement>("[data-scene-link]")];
const currentSceneLabel = document.querySelector<HTMLElement>(".sequence-current");
const sceneProgress = document.querySelector<HTMLElement>(".sequence-progress-fill");
let sceneProgressValue = 0;

type VisualTreatment = {
  imageInset: string;
  scale: number;
  xPercent: number;
  yPercent: number;
  origin: string;
  copyFrom: { x: number; y: number; scale: number };
  copyExit: { x: number; y: number };
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
  aftermath: {
    imageInset: "inset(0 0 18% 0)",
    scale: 1.14,
    xPercent: 0,
    yPercent: 1,
    origin: "50% 58%",
    copyFrom: { x: 0, y: 30, scale: 0.98 },
    copyExit: { x: 0, y: -18 },
  },
  return: {
    imageInset: "inset(0 70% 0 0)",
    scale: 1.15,
    xPercent: -1,
    yPercent: 0,
    origin: "40% 50%",
    copyFrom: { x: -34, y: 0, scale: 1 },
    copyExit: { x: 0, y: -16 },
  },
  objective: {
    imageInset: "inset(18% 0 0 0)",
    scale: 1.13,
    xPercent: 1,
    yPercent: 0,
    origin: "65% 42%",
    copyFrom: { x: 0, y: 26, scale: 0.98 },
    copyExit: { x: 16, y: 0 },
  },
};

const getVisualTreatment = (element: HTMLElement) =>
  visualTreatments[element.dataset.visual ?? ""] ?? visualTreatments.panorama;

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

  if (currentSceneLabel) {
    currentSceneLabel.textContent = String(index + 1).padStart(2, "0");
  }
};

const refreshScrollPositions = () => {
  if (document.readyState === "complete") {
    ScrollTrigger.refresh();
  } else {
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  }
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
  heroReveal.fromTo(
    ".hero h1",
    { autoAlpha: 0, clipPath: "inset(0 100% 0 0)", x: -14 },
    {
      autoAlpha: 1,
      clipPath: "inset(0 0 0 0)",
      x: 0,
      duration: 0.8,
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
const atmosphereRanges = new Map<string, readonly [number, number]>([
  ["inicio", [0, 0.15]],
  ["guerra", [0.15, 0.35]],
  ["personajes", [0.36, 0.56]],
  ["historia", [0.57, 0.78]],
  ["arsenal", [0.8, 0.9]],
]);
const atmosphereSections = [
  ...document.querySelectorAll<HTMLElement>(
    ".hero, .war-sequence, .character-section, .chronicle-section, .arsenal-section, .aftermath",
  ),
];

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

  const atmosphereSection = atmosphereSections.find((section) => {
    const bounds = section.getBoundingClientRect();
    return bounds.top <= activeLine && bounds.bottom > activeLine;
  });

  if (atmosphereSection) {
    const [start, end] = atmosphereRanges.get(atmosphereSection.id || atmosphereSection.classList[0]) ?? [
      0.9,
      1,
    ];
    const bounds = atmosphereSection.getBoundingClientRect();
    const progress = Math.min(
      1,
      Math.max(0, (activeLine - bounds.top) / Math.max(bounds.height, 1)),
    );
    sceneProgressValue = start + (end - start) * progress;
  } else if (window.scrollY < 40) {
    sceneProgressValue = 0;
  } else if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    sceneProgressValue = 1;
  }
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
        onUpdate: (self) => {
          setActiveScene(Math.min(scenes.length - 1, Math.floor(self.progress * scenes.length)));
        },
      },
    });

    scenes.forEach((scene, index) => {
      const image = scene.querySelector(".scene-image");
      const copy = scene.querySelector(".scene-copy");
      const treatment = getVisualTreatment(scene);

      if (image) {
        timeline.fromTo(
          image,
          {
            clipPath: treatment.imageInset,
            scale: treatment.scale,
            xPercent: treatment.xPercent,
            yPercent: treatment.yPercent,
            transformOrigin: treatment.origin,
          },
          {
            clipPath: "inset(0 0 0 0)",
            scale: 1.025,
            xPercent: 0,
            yPercent: 0,
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
  currentLabel: HTMLElement | null;
};

const setupEditorialSequence = ({
  track,
  stage,
  slides,
  links,
  currentLabel,
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

    if (currentLabel) {
      currentLabel.textContent = String(index + 1).padStart(2, "0");
    }
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
      setActive(0, true);
      gsap.set(slides, { autoAlpha: 0 });
      gsap.set(slides[0], { autoAlpha: 1 });
      slides.forEach((slide, index) => {
        gsap.set(slide.querySelector(".editorial-copy"), {
          autoAlpha: index === 0 ? 1 : 0,
          y: index === 0 ? 0 : 28,
        });
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          pin: stage,
          start: "top top",
          end: () => `+=${window.innerHeight * (slides.length - 1)}`,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const [start, end] =
              track.closest(".character-section")
                ? ([0.36, 0.56] as const)
                : ([0.57, 0.78] as const);
            sceneProgressValue = start + (end - start) * self.progress;
            const sequencePosition = self.progress * (slides.length - 1);
            const index = Math.min(
              slides.length - 1,
              Math.max(0, Math.floor(sequencePosition - 0.91 + 1)),
            );
            setActive(index, true);
          },
        },
      });

      slides.forEach((slide, index) => {
        const image = slide.querySelector(".editorial-image");
        const copy = slide.querySelector(".editorial-copy");
        const treatment = getVisualTreatment(slide);

        if (image) {
          timeline.fromTo(
            image,
            {
              clipPath: treatment.imageInset,
              scale: treatment.scale,
              xPercent: treatment.xPercent,
              yPercent: treatment.yPercent,
              transformOrigin: treatment.origin,
            },
            {
              clipPath: "inset(0 0 0 0)",
              scale: 1.025,
              xPercent: 0,
              yPercent: 0,
              duration: 1,
              ease: "none",
            },
            index,
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
                duration: 0.24,
                ease: "power2.out",
              },
              transitionAt + 0.02,
            );
          }
        }
      });

      const navigateToSlide = (event: MouseEvent) => {
        const link = event.currentTarget;
        if (!(link instanceof HTMLAnchorElement)) return;
        const index = links.indexOf(link);
        const trigger = timeline.scrollTrigger;
        if (index < 0 || !trigger) return;

        event.preventDefault();
        const progress = index / (slides.length - 1);
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
      setActive(0, false);
      slides.forEach((slide, index) => {
        const copy = slide.querySelector(".editorial-copy");
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
    currentLabel: root.querySelector<HTMLElement>("[data-editorial-current]"),
  });
};

const characterSection = document.querySelector<HTMLElement>(".character-section");
if (characterSection) {
  initializeEditorialSequence(characterSection);
}

const spoilerDisclosure = document.querySelector<HTMLDetailsElement>(".spoiler-disclosure");
let chronicleMedia: gsap.MatchMedia | { revert: () => void } | null = null;

spoilerDisclosure?.addEventListener("toggle", () => {
  if (spoilerDisclosure.open) {
    if (!chronicleMedia) {
      chronicleMedia = initializeEditorialSequence(spoilerDisclosure);
      window.requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  } else {
    chronicleMedia?.revert();
    chronicleMedia = null;
    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  }
});

const mobileMenu = document.querySelector<HTMLDetailsElement>(".mobile-menu");
const mobileMenuSummary = mobileMenu?.querySelector<HTMLElement>("summary");

mobileMenu?.addEventListener("toggle", () => {
  const isOpen = mobileMenu.open;
  mobileMenuSummary?.setAttribute("aria-expanded", String(isOpen));
  mobileMenuSummary?.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.open = false;
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

const canvas = document.querySelector<HTMLCanvasElement>("#ember-field");

if (canvas && !reducedMotion) {
  const startThreeScene = async () => {
    try {
      const { createAtmosphere } = await import("./atmosphere");
      createAtmosphere(canvas, () => sceneProgressValue);
    } catch (error) {
      canvas.hidden = true;
      console.warn("No se pudo iniciar la atmósfera 3D; continúa el fondo estático.", error);
    }
  };

  const loadThree = () => {
    void startThreeScene();
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadThree, { timeout: 1800 });
  } else {
    window.setTimeout(loadThree, 450);
  }
}
