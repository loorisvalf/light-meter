var config = {
  "addon": {
    "camera": "about://settings/content/camera",
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
    }
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (config.port.name === "win") {
        if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
        config.resize.timeout = window.setTimeout(async function () {
          const current = await chrome.windows.getCurrent();
          /*  */
          config.storage.write("interface.size", {
            "top": current.top,
            "left": current.left,
            "width": current.width,
            "height": current.height
          });
        }, 1000);
      }
    }
  },
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          let tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp, function () {});
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id, function () {});
        }
      }
    }
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      const context = document.documentElement.getAttribute("context");
      /*  */
      if (chrome.runtime) {
        if (chrome.runtime.connect) {
          if (context !== config.port.name) {
            if (document.location.search === "?tab") config.port.name = "tab";
            if (document.location.search === "?win") config.port.name = "win";
            if (document.location.search === "?popup") config.port.name = "popup";
            /*  */
            if (config.port.name === "popup") {
              document.documentElement.style.width = "780px";
              document.documentElement.style.height = "600px";
              OPTIONS.scales.yAxes[0].scaleLabel.display = false;
              OPTIONS.scales.yAxes[1].scaleLabel.display = false;
            }
            /*  */
            chrome.runtime.connect({"name": config.port.name});
          }
        }
      }
      /*  */
      document.documentElement.setAttribute("context", config.port.name);
    }
  },
  "load": function () {
    config.app.elements.video = document.querySelector(".video");
    config.app.elements.canvas = document.querySelector("canvas");
    config.app.elements.loader = document.querySelector(".loader");
    config.app.elements.camera = document.getElementById("camera");
    config.app.elements.reload = document.getElementById("reload");
    config.app.elements.support = document.getElementById("support");
    config.app.elements.interval = document.getElementById("interval");
    config.app.elements.donation = document.getElementById("donation");
    config.app.elements.range = document.getElementById("precision-factor");
    config.app.elements.calibration = document.getElementById("calibration");
    config.app.elements.context = config.app.elements.canvas.getContext("2d");
    config.app.elements.progress = config.app.elements.loader.querySelector('p');
    /*  */
    config.app.elements.reload.addEventListener("click", function () {
      document.location.reload();
    });
    /*  */
    config.app.elements.range.addEventListener("change", function () {
      config.app.lightmeter.video.initialize();
    });
    /*  */
    config.app.elements.camera.addEventListener("change", function (e) {
      config.app.show.camera = e.target.checked;
      config.app.elements.video.style.display = config.app.show.camera ? "flex": "none";
    });
    /*  */
    config.app.elements.calibration.addEventListener("change", function (e) {
      const target = parseInt(e.target.value);
      const value = target > 255 || target < 0 ? 30 : target;
      /*  */
      config.app.calibration.value = value;
    });
    /*  */
    config.app.elements.support.addEventListener("click", function () {
      if (config.port.name !== "webapp") {
        const url = config.addon.homepage();
        chrome.tabs.create({"url": url, "active": true});
      }
    }, false);
    /*  */
    config.app.elements.donation.addEventListener("click", function () {
      if (config.port.name !== "webapp") {
        const url = config.addon.homepage() + "?reason=support";
        chrome.tabs.create({"url": url, "active": true});
      }
    }, false);
    /*  */
    config.app.elements.interval.addEventListener("change", function (e) {
      const target = parseInt(e.target.value);
      const value = target > 10000 || target < 1 ? 250 : target;
      config.app.interval.value = value;
      config.app.lightmeter.render();
    });
    /*  */
    config.app.elements.range.addEventListener("input", function (e) {
      config.app.precision.factor = Number(e.target.value);
      const percent = Math.round((config.app.precision.factor / 128) * 100) + '%';
      const info = "inspecting " + config.app.precision.factor + '×' + config.app.precision.factor + " pixels";
      e.target.nextElementSibling.value = percent + ' ' + '(' + info + ')';
    });
    /*  */
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
  },
  "app": {
    "elements": {},
    "variable": {
      "data": DATA, 
      "options": OPTIONS
    },
    "precision": {
      set factor (val) {config.storage.write("precision-factor", val)},
      get factor () {return config.storage.read("precision-factor") !== undefined ? config.storage.read("precision-factor") : 16}
    },
    "show": {
      set camera (val) {config.storage.write("show-camera", val)},
      get camera () {return config.storage.read("show-camera") !== undefined ? config.storage.read("show-camera") : false}
    },    
    "calibration": {
      set value (val) {config.storage.write("calibration", val)},
      get value () {return config.storage.read("calibration") !== undefined ? config.storage.read("calibration") : 0}
    },
    "interval": {
      "instance": null,
      set value (val) {config.storage.write("interval", val)},
      get value () {return config.storage.read("interval") !== undefined ? config.storage.read("interval") : 250}
    },
    "start": function () {
      if (config.app.interval.instance) window.clearInterval(config.app.interval.instance);
      if (config.port.name === "popup") config.app.variable.options.layout.padding.bottom = 58;
      /*  */
      config.app.elements.calibration.value = config.app.calibration.value;
      config.app.elements.interval.value = config.app.interval.value;
      /*  */
      config.app.lightmeter.start();
    },
    "lightmeter": {
      "video": null,
      "canvas": null,
      "context": null,
      "started": false,
      "metrics": {
        "start": 0,
        "duration": 0
      },
      "error": async function (e) {
        const error = e && e.message && e.message.indexOf("denied") !== -1;
        const permission = await navigator.permissions.query({"name": "camera"});
        /*  */
        if (config.port.name !== "webapp") {
          if (error) {
            config.app.elements.progress.textContent = "Camera permission is denied by the system (OS)! Please adjust the permission and try again.";
          }
          /*  */
          if (permission.state === "denied") {
            config.app.elements.progress.textContent = "Camera permission is denied! Please adjust the permission and try again.";
            window.alert("Camera permission is denied!\nPlease adjust the permission and try again.");
            chrome.tabs.create({"url": config.addon.camera, "active": true});
          }
        }
      },
      "start": function  () {
        config.app.lightmeter.metrics.start = Date.now();
        config.app.elements.loader.style.display = "block";
        config.app.elements.camera.checked = config.app.show.camera;
        config.app.elements.range.value = config.app.precision.factor;
        config.app.elements.video.style.display = config.app.show.camera ? "flex": "none";
        /*  */
        const percent = Math.round((config.app.precision.factor / 128) * 100) + '%';
        const info = "inspecting " + config.app.precision.factor + '×' + config.app.precision.factor + " pixels";
        config.app.elements.range.nextElementSibling.value = percent + ' ' + '(' + info + ')';
        /*  */
        for (let i = 0; i < 30; i++) config.app.variable.data.labels.push((i + 1) + '');
        for (let i = 0; i < 30; i++) config.app.variable.data.datasets[0].data.push(165);
        for (let i = 0; i < 30; i++) config.app.variable.data.datasets[1].data.push(165);
        for (let i = 0; i < 30; i++) config.app.variable.data.datasets[2].data.push(160);
        for (let i = 0; i < 30; i++) config.app.variable.data.datasets[3].data.push(160);
        for (let i = 0; i < 30; i++) config.app.variable.data.datasets[4].data.push(155);
        for (let i = 0; i < 30; i++) config.app.variable.data.datasets[5].data.push(155);
        for (let i = 0; i < 30; i++) config.app.variable.data.datasets[6].data.push(150);
        for (let i = 0; i < 30; i++) config.app.variable.data.datasets[7].data.push(150);
        for (let i = 0; i < 30; i++) config.app.variable.data.datasets[8].data.push(120);
        for (let i = 0; i < 30; i++) config.app.variable.data.datasets[9].data.push(120);
        /*  */
        window.soundchart = new Chart(config.app.elements.context, config.app.variable);
        config.app.lightmeter.update();
        /*  */
        if (navigator.mediaDevices) {
          navigator.mediaDevices.getUserMedia({"video": true}).then(function (stream) {
            config.app.lightmeter.video.initialize(stream);
          }).catch(config.app.lightmeter.error);
        } else {
          config.app.elements.progress.textContent = "Error! navigator.mediaDevices is not supported!";
        }
      },
      "video": {
        "stream": null,
        "element": null,
        "listener": function () {
          if (!config.app.lightmeter.started) {
            if (config.app.lightmeter.canvas) config.app.lightmeter.canvas.remove();
            config.app.lightmeter.metrics.start = Date.now();
            delete config.app.lightmeter.context;
            config.app.lightmeter.started = true;
            /*  */
            config.app.lightmeter.canvas = document.createElement("canvas");
            config.app.lightmeter.canvas.setAttribute("width", config.app.precision.factor);
            config.app.lightmeter.canvas.setAttribute("height", config.app.precision.factor);
            config.app.lightmeter.context = config.app.lightmeter.canvas.getContext("2d", {"willReadFrequently": true});
            /*  */
            config.app.lightmeter.render();
          }
        },
        "initialize": async function (e) {
          config.app.lightmeter.started = false;
          if (e) config.app.lightmeter.video.stream = e;
          /*  */
          if (config.app.lightmeter.video.stream) {
            config.app.lightmeter.video.element = document.querySelector("video");
            /*  */
            config.app.lightmeter.video.element.pause();
            config.app.lightmeter.video.element.removeAttribute("src");
            config.app.lightmeter.video.element.removeAttribute("width");
            config.app.lightmeter.video.element.removeAttribute("height");
            config.app.lightmeter.video.element.removeAttribute("srcObject");
            config.app.lightmeter.video.element.removeEventListener("canplay", config.app.lightmeter.video.listener);
            /*  */
            window.setTimeout(function () {
              config.app.lightmeter.video.element.setAttribute("height", config.app.precision.factor);
              config.app.lightmeter.video.element.setAttribute("width", config.app.precision.factor);
              config.app.lightmeter.video.element.srcObject = config.app.lightmeter.video.stream;
              config.app.lightmeter.video.element.play();
              /*  */
              config.app.lightmeter.video.element.addEventListener("canplay", config.app.lightmeter.video.listener, false);
            }, 100);
          } else {
            config.app.elements.progress.textContent = "An unexpected error occurred!";
          }
        }
      },
      "render": function () {
        if (config.app.interval.instance) window.clearInterval(config.app.interval.instance);
        config.app.interval.instance = window.setInterval(function () {
          const precision = config.app.precision.factor;
          const pixel = {
            "count": 0,
            "luminance": 0,
            "rgba": {
              'r': 0, 
              'g': 0, 
              'b': 0, 
              'a': 0
            }
          };
          /*  */
          if (config.app.lightmeter.context) {
            config.app.lightmeter.context.beginPath();
            config.app.lightmeter.context.clearRect(0, 0, precision, precision);
            config.app.lightmeter.context.drawImage(config.app.lightmeter.video.element, 0, 0, precision, precision);
            /*  */
            const imagedata = config.app.lightmeter.context.getImageData(0, 0, precision, precision);
            for (let i = 0; i < imagedata.data.length; i += 4) {
              ++pixel.count;
              //
              const r = imagedata.data[i + 0] + config.app.calibration.value;
              const g = imagedata.data[i + 1] + config.app.calibration.value;
              const b = imagedata.data[i + 2] + config.app.calibration.value;
              const a = imagedata.data[i + 3] + config.app.calibration.value;
              //
              pixel.rgba.r += r;
              pixel.rgba.g += g;
              pixel.rgba.b += b;
              pixel.rgba.a += a;
              pixel.luminance += 0.2126 * r + 0.7152 * g + 0.0722 * b;
            }
            /*  */
            pixel.rgba.r = pixel.rgba.r / pixel.count;
            pixel.rgba.g = pixel.rgba.g / pixel.count;
            pixel.rgba.b = pixel.rgba.b / pixel.count;
            pixel.rgba.a = pixel.rgba.a / pixel.count;
            pixel.luminance = pixel.luminance / pixel.count;
          }
          /*  */
          config.app.lightmeter.update(pixel);
        }, config.app.interval.value);
      },
      "update": function (pixel) {
        const date = new Date(null);
        const rgb = document.getElementById("rgb");
        const level = document.getElementById("level");
        const duration = document.getElementById("duration");
        const luminance = document.getElementById("luminance");
        /*  */
        date.setSeconds((Date.now() - config.app.lightmeter.metrics.start) / 1000);
        config.app.lightmeter.metrics.duration = date.toISOString().slice(11, 19);
        duration.textContent = config.app.lightmeter.metrics.duration;
        /*  */
        if (pixel) {
          const R = Math.round(pixel.rgba.r);
          const G = Math.round(pixel.rgba.g);
          const B = Math.round(pixel.rgba.b);
          const A = Math.round(pixel.rgba.a);
          const L = Math.round(pixel.luminance);
          const P = Math.round((pixel.luminance / 255) * 100);
          /*  */
          luminance.textContent = L + " / 255";
          config.app.elements.loader.style.display = "none";
          rgb.textContent = "rgb(" + R + ", " + G + ", " + B + ")";
          level.textContent = "R:" + R + " G:" + G + " B:" + B + " - Luminance:" + P + '%';
          /* R */
          window.soundchart.data.datasets[0].data.push(pixel.rgba.r);
          window.soundchart.data.datasets[1].data.push(pixel.rgba.r);
          window.soundchart.data.datasets[0].data.shift();
          window.soundchart.data.datasets[1].data.shift();
          /* G */
          window.soundchart.data.datasets[2].data.push(pixel.rgba.g);
          window.soundchart.data.datasets[3].data.push(pixel.rgba.g);
          window.soundchart.data.datasets[2].data.shift();
          window.soundchart.data.datasets[3].data.shift();
          /* B */
          window.soundchart.data.datasets[4].data.push(pixel.rgba.b);
          window.soundchart.data.datasets[5].data.push(pixel.rgba.b);
          window.soundchart.data.datasets[4].data.shift();
          window.soundchart.data.datasets[5].data.shift();
          /* A */
          window.soundchart.data.datasets[6].data.push(pixel.rgba.a);
          window.soundchart.data.datasets[7].data.push(pixel.rgba.a);
          window.soundchart.data.datasets[6].data.shift();
          window.soundchart.data.datasets[7].data.shift();
          /* L */
          window.soundchart.data.datasets[8].data.push(pixel.luminance);
          window.soundchart.data.datasets[9].data.push(pixel.luminance);
          window.soundchart.data.datasets[8].data.shift();
          window.soundchart.data.datasets[9].data.shift();
        }
        /*  */
        window.soundchart.update();
      }
    }
  }
};

config.port.connect();

window.addEventListener("load", config.load, false);
window.addEventListener("resize", config.resize.method, false);
