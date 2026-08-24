/* FNCTION dashboard renderer. Reads window.FNCTION_DATA (data/dashboard.js). */
(function () {
  "use strict";

  var data = window.FNCTION_DATA;
  var main = document.getElementById("main");

  if (!data) {
    main.innerHTML = '<p class="panel">Dashboard data failed to load. Check <code>data/dashboard.js</code>.</p>';
    return;
  }

  var tones = data.statusTones || {};

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* A null value means "not filled in yet" — show the placeholder mask rather
     than a zero, so an empty figure never reads as a real one. */
  function formatValue(item) {
    if (item.value == null) {
      return {
        text: item.format === "currency" ? (data.currency || "") + "XX,XXX" : "—",
        placeholder: true
      };
    }
    if (item.format === "currency") {
      return {
        text: (data.currency || "") + Number(item.value).toLocaleString("en-GB"),
        placeholder: false
      };
    }
    return { text: Number(item.value).toLocaleString("en-GB"), placeholder: false };
  }

  function statusNode(status) {
    var tone = tones[status] || "";
    var wrap = el("span", "status" + (tone ? " status--" + tone : ""));
    wrap.appendChild(el("i", "dot" + (tone ? " dot--" + tone : "")));
    wrap.appendChild(el("span", "status__text", status));
    return wrap;
  }

  function panel(section) {
    var node = el("section", "panel");
    node.dataset.id = section.id;
    node.setAttribute("aria-labelledby", "panel-" + section.id);
    var heading = el("h2", "panel__title", section.title);
    heading.id = "panel-" + section.id;
    node.appendChild(heading);
    return node;
  }

  function renderMetrics(section) {
    var node = panel(section);
    var grid = el("div", "metrics");

    section.items.forEach(function (item) {
      var card = el("div", "metric");
      if (item.tone) card.dataset.tone = item.tone;

      var formatted = formatValue(item);
      var value = el("span", "metric__value" + (formatted.placeholder ? " metric__value--placeholder" : ""), formatted.text);
      if (formatted.placeholder) value.title = "Not filled in yet";

      card.appendChild(value);
      card.appendChild(el("span", "metric__label", item.label));
      grid.appendChild(card);
    });

    node.appendChild(grid);
    return node;
  }

  function renderGroups(section) {
    var node = panel(section);
    var grid = el("div", "groups");

    section.groups.forEach(function (group) {
      var box = el("div", "group");
      box.appendChild(el("h3", "group__name", group.name));

      var list = el("ul", "lines");
      group.lines.forEach(function (line) {
        var row = el("li", "line");
        row.appendChild(el("span", "line__label", line.label));
        row.appendChild(statusNode(line.status));
        list.appendChild(row);
      });

      box.appendChild(list);
      grid.appendChild(box);
    });

    node.appendChild(grid);
    return node;
  }

  function renderChannels(section) {
    var node = panel(section);
    var list = el("ul", "channels");

    section.items.forEach(function (item) {
      var row = el("li", "channel");
      row.appendChild(el("span", "channel__label", item.label));
      row.appendChild(statusNode(item.status));
      list.appendChild(row);
    });

    node.appendChild(list);
    return node;
  }

  var renderers = {
    metrics: renderMetrics,
    groups: renderGroups,
    channels: renderChannels
  };

  function render() {
    document.getElementById("brand").textContent = data.brand || "FNCTION";
    document.getElementById("tagline").textContent = data.tagline || "";

    var updated = document.getElementById("updated");
    if (data.updated) {
      updated.dateTime = data.updated;
      var parsed = new Date(data.updated + "T00:00:00");
      updated.textContent = isNaN(parsed)
        ? data.updated
        : parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }

    (data.sections || []).forEach(function (section) {
      var render = renderers[section.type];
      if (render) main.appendChild(render(section));
    });
  }

  /* Theme: remembered per browser, defaults to the OS preference. */
  function initTheme() {
    var root = document.documentElement;
    var button = document.getElementById("theme-toggle");
    var icon = document.getElementById("theme-icon");
    var label = document.getElementById("theme-label");

    var stored = null;
    try { stored = localStorage.getItem("fnction-theme"); } catch (err) { /* private mode */ }

    var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    apply(stored || (prefersLight ? "light" : "dark"));

    function apply(theme) {
      root.dataset.theme = theme;
      var next = theme === "dark" ? "Light" : "Dark";
      label.textContent = next;
      icon.textContent = theme === "dark" ? "◐" : "◑";
      button.setAttribute("aria-label", "Switch to " + next.toLowerCase() + " theme");
    }

    button.addEventListener("click", function () {
      var theme = root.dataset.theme === "dark" ? "light" : "dark";
      apply(theme);
      try { localStorage.setItem("fnction-theme", theme); } catch (err) { /* private mode */ }
    });
  }

  render();
  initTheme();
})();
