/* =========================================================================
   Copie Exelmans — comportements du site.
   Vanilla JS, aucune dépendance, chargé en `defer`.
   Tout est en amélioration progressive : sans JS, le site reste lisible
   et navigable (les réponses FAQ sont ouvertes, toutes les familles du
   catalogue sont affichées, le formulaire reste un formulaire HTML).
   ========================================================================= */
(function () {
  "use strict";

  /* -----------------------------------------------------------------------
     CONFIGURATION DU FORMULAIRE DE CONTACT
     -----------------------------------------------------------------------
     Laisser FORM_ENDPOINT vide => le formulaire ouvre le logiciel de
     messagerie du visiteur avec un message pré-rempli (aucun serveur requis).
     Renseigner une URL (Formspree, Basin, Netlify Forms, votre propre API…)
     => la demande est envoyée en arrière-plan par POST.
     Exemple : var FORM_ENDPOINT = "https://formspree.io/f/xxxxxxxx";
  --------------------------------------------------------------------- */
  var FORM_ENDPOINT = "";
  var CONTACT_EMAIL = "copiexelmans@gmail.com";

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* == 1. Apparition au défilement ====================================== */
  function initReveal() {
    var nodes = $$(".reveal");
    if (!nodes.length) return;

    var show = function (el) {
      el.classList.remove("is-armed");
      el.classList.add("is-in");
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      nodes.forEach(show);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          show(entry.target);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    nodes.forEach(function (el) {
      // Déjà dans la fenêtre au chargement : on affiche sans animer,
      // pour éviter tout clignotement au-dessus de la ligne de flottaison.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
        show(el);
        return;
      }
      el.classList.add("is-armed");
      io.observe(el);
    });
  }

  /* == 2. Tout ce qui réagit au défilement ============================== */
  /* Un seul écouteur, throttlé par requestAnimationFrame, pour la jauge de
     progression, le filet de l'en-tête, le bouton de retour en haut, la
     barre d'action mobile et la dérive du halo du héro. */
  function initScrollUi() {
    var header = $(".site-header");
    var progress = $(".scroll-progress");
    var toTop = $(".to-top");
    var bar = $(".mobile-bar");
    var halo = $(".hero-halo");
    var ticking = false;

    var update = function () {
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (header) header.classList.toggle("is-stuck", y > 8);

      if (progress) {
        var ratio = max > 0 ? Math.min(y / max, 1) : 0;
        progress.style.transform = "scaleX(" + ratio + ")";
      }

      // On attend d'avoir dépassé le premier écran pour proposer ces raccourcis.
      var past = y > window.innerHeight * 0.75;
      if (toTop) toTop.classList.toggle("is-visible", past);
      if (bar) bar.classList.toggle("is-visible", past);

      // Parallaxe discrète : le halo dérive moins vite que la page.
      if (halo && !reduceMotion && y < window.innerHeight * 1.5) {
        halo.style.transform = "translate3d(0," + (y * 0.16).toFixed(1) + "px,0)";
      }

      ticking = false;
    };

    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true }
    );
    window.addEventListener("resize", update);
    update();

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
  }

  /* == 2 bis. Apparition séquencée (le devis, ligne par ligne) ==========
     La carte est juste sous le premier écran : un IntersectionObserver la
     verrait « visible » dès le chargement et jouerait la séquence avant que
     le visiteur n'arrive dessus. On exige donc deux choses : que la page ait
     été défilée au moins une fois, et que la carte soit franchement entrée
     dans la fenêtre. Un filet de sécurité affiche tout au bout de quelques
     secondes pour que le contenu ne reste jamais invisible. */
  function initSequence() {
    $$("[data-seq]").forEach(function (group) {
      var parts = $$("[data-seq-item]", group);
      if (!parts.length) return;

      if (reduceMotion) {
        parts.forEach(function (p) { p.classList.add("is-in"); });
        return;
      }

      parts.forEach(function (p) { p.classList.add("is-armed"); });

      var played = false;

      var play = function () {
        if (played) return;
        played = true;
        window.removeEventListener("scroll", onScroll);
        parts.forEach(function (part, i) {
          setTimeout(function () {
            part.classList.remove("is-armed");
            part.classList.add("is-in");
          }, 120 + i * 170);
        });
      };

      var wellInView = function () {
        var r = group.getBoundingClientRect();
        return r.top < window.innerHeight * 0.72 && r.bottom > window.innerHeight * 0.15;
      };

      function onScroll() {
        if (wellInView()) play();
      }

      window.addEventListener("scroll", onScroll, { passive: true });

      // Page trop courte pour défiler, ou visiteur qui ne défile pas :
      // on ne laisse pas le devis masqué indéfiniment.
      setTimeout(function () {
        if (!played) play();
      }, 5000);
    });
  }

  /* == 3. Menu mobile =================================================== */
  function initNav() {
    var burger = $(".burger");
    var nav = $("#site-nav");
    if (!burger || !nav) return;

    var setOpen = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      nav.classList.toggle("is-open", open);
    };

    burger.addEventListener("click", function () {
      setOpen(burger.getAttribute("aria-expanded") !== "true");
    });

    // Un lien cliqué referme le panneau.
    $$("a", nav).forEach(function (link) {
      link.addEventListener("click", function () { setOpen(false); });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (burger.getAttribute("aria-expanded") !== "true") return;
      setOpen(false);
      burger.focus();
    });

    document.addEventListener("click", function (e) {
      if (burger.getAttribute("aria-expanded") !== "true") return;
      if (nav.contains(e.target) || burger.contains(e.target)) return;
      setOpen(false);
    });

    // Retour au bureau : on repart d'un état propre.
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1000) setOpen(false);
    });
  }

  /* == 4. FAQ (une seule réponse ouverte à la fois) ===================== */
  function initFaq() {
    var items = $$(".faq-item");
    if (!items.length) return;

    var panels = items.map(function (item) {
      var btn = $(".faq-q", item);
      var panel = $(".faq-a", item);
      if (!btn || !panel) return null;

      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");

      btn.addEventListener("click", function () {
        var willOpen = btn.getAttribute("aria-expanded") !== "true";
        panels.forEach(function (p) {
          if (!p) return;
          p.btn.setAttribute("aria-expanded", "false");
          p.panel.hidden = true;
          p.item.classList.remove("is-open");
        });
        if (willOpen) {
          btn.setAttribute("aria-expanded", "true");
          panel.hidden = false;
          item.classList.add("is-open");
        }
      });

      return { btn: btn, panel: panel, item: item };
    });
  }

  /* == 5. Filtres du catalogue ========================================== */
  function initFilters() {
    var bar = $(".filters");
    var families = $$("[data-family]");
    if (!bar || !families.length) return;

    var buttons = $$(".filter", bar);
    var live = $("#filters-status");

    var apply = function (key) {
      var shown = 0;
      families.forEach(function (fam) {
        var match = key === "all" || fam.getAttribute("data-family") === key;
        fam.hidden = !match;
        if (match) shown++;
      });
      buttons.forEach(function (btn) {
        btn.setAttribute("aria-pressed", String(btn.getAttribute("data-filter") === key));
      });
      if (live) {
        live.textContent =
          shown > 1 ? shown + " familles affichées" : shown + " famille affichée";
      }
    };

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(btn.getAttribute("data-filter"));
      });
    });

    bar.classList.add("is-ready");
    apply("all");
  }

  /* == 6. Formulaire de contact ========================================= */
  function initContactForm() {
    var form = $("#contact-form");
    if (!form) return;

    var card = form.closest(".form-card") || form.parentNode;
    var success = $("#contact-success");
    var successText = $("#contact-success-text");
    var errorBox = $("#contact-error");
    var submit = $('button[type="submit"]', form);
    var resetBtn = $("#contact-reset");

    var showError = function (message) {
      if (!errorBox) return;
      errorBox.textContent = message;
      errorBox.hidden = false;
      errorBox.scrollIntoView({ block: "nearest" });
    };

    var showSuccess = function (message) {
      if (errorBox) errorBox.hidden = true;
      if (successText && message) successText.textContent = message;
      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
      if (card && card.scrollIntoView) card.scrollIntoView({ block: "nearest" });
    };

    var collect = function () {
      var data = new FormData(form);
      var needs = data.getAll("besoins");
      return {
        data: data,
        resume:
          "Profil : " + (data.get("profil") || "—") + "\n" +
          "Nom : " + (data.get("nom") || "—") + "\n" +
          "Société : " + (data.get("societe") || "—") + "\n" +
          "Téléphone : " + (data.get("telephone") || "—") + "\n" +
          "Email : " + (data.get("email") || "—") + "\n" +
          "Travaux : " + (needs.length ? needs.join(", ") : "—") + "\n\n" +
          "Projet :\n" + (data.get("message") || "—")
      };
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errorBox) errorBox.hidden = true;
      if (!form.reportValidity()) return;

      var payload = collect();

      // Pas d'endpoint configuré : passage par le logiciel de messagerie.
      if (!FORM_ENDPOINT) {
        var subject = "Demande de devis — " + (payload.data.get("nom") || "site Copie Exelmans");
        window.location.href =
          "mailto:" + CONTACT_EMAIL +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(payload.resume);
        showSuccess(
          "Votre logiciel de messagerie vient de s'ouvrir avec la demande pré-remplie : " +
          "il ne reste qu'à l'envoyer. Si rien ne s'est passé, écrivez-nous à " +
          CONTACT_EMAIL + " ou appelez le 09 83 65 33 03."
        );
        return;
      }

      if (submit) {
        submit.disabled = true;
        submit.textContent = "Envoi en cours…";
      }

      fetch(FORM_ENDPOINT, {
        method: "POST",
        body: payload.data,
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          showSuccess(
            "Merci. Nous revenons vers vous avec un devis. " +
            "Pour une urgence, appelez le 09 83 65 33 03."
          );
        })
        .catch(function () {
          showError(
            "L'envoi a échoué. Réessayez, écrivez-nous à " + CONTACT_EMAIL +
            " ou appelez le 09 83 65 33 03."
          );
        })
        .then(function () {
          if (submit) {
            submit.disabled = false;
            submit.textContent = "Demander un devis";
          }
        });
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        form.reset();
        if (success) success.hidden = true;
        form.hidden = false;
        var first = $("input, textarea", form);
        if (first) first.focus();
      });
    }
  }

  /* == 7. Année courante dans le pied de page =========================== */
  function initYear() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  initReveal();
  initScrollUi();
  initSequence();
  initNav();
  initFaq();
  initFilters();
  initContactForm();
  initYear();
})();
