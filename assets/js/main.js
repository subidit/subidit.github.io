const themeSwitcher = {
  // Config
  _scheme: "auto",
  buttonTarget: "#theme-toggle",
  rootAttribute: "data-theme",
  localStorageKey: "picoPreferredColorScheme",

  // Init
  init() {
    this.scheme = this.schemeFromLocalStorage;
    this.initSwitcher();
    this.updateButton();
  },

  // Get color scheme from local storage
  get schemeFromLocalStorage() {
    return window.localStorage?.getItem(this.localStorageKey) ?? this._scheme;
  },

  // Preferred color scheme
  get preferredColorScheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  },

  // Init switcher
  initSwitcher() {
    const button = document.querySelector(this.buttonTarget);
    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        // Toggle scheme
        this.scheme = this.scheme === "dark" ? "light" : "dark";
        this.updateButton();
        this.animateButton(); // Call the animateButton function
      },
      false
    );
  },

  // Set scheme
  set scheme(scheme) {
    if (scheme == "auto") {
      this._scheme = this.preferredColorScheme;
    } else if (scheme == "dark" || scheme == "light") {
      this._scheme = scheme;
    }
    this.applyScheme();
    this.schemeToLocalStorage();
  },

  // Get scheme
  get scheme() {
    return this._scheme;
  },

  // Apply scheme
  applyScheme() {
    document.querySelector("html")?.setAttribute(this.rootAttribute, this.scheme);
  },

  // Store scheme to local storage
  schemeToLocalStorage() {
    window.localStorage?.setItem(this.localStorageKey, this.scheme);
  },

  // Update button emoji
  updateButton() {
    const button = document.querySelector(this.buttonTarget);
    if (this.scheme === "dark") {
      button.textContent = "🌜";
    } else {
      button.textContent = "🌞";
    }
  },

  // Animate button
  animateButton() {
    const button = document.querySelector(this.buttonTarget);
    button.style.transition = "transform 0.15s ease-in-out, opacity 0.15s ease-in-out"; // Adjusted timing for quicker animation
    button.style.transform = "rotate(180deg) scale(1.1)"; // Apply rotation and scale
    button.style.opacity = "0"; // Set opacity to 0 to make it disappear during animation
    setTimeout(() => {
      button.style.transform = "rotate(0) scale(1)"; // Reset rotation and scale after 150ms
      button.style.opacity = "1"; // Reset opacity to make it appear again
    }, 150);
  }

};

// Init
themeSwitcher.init();