const OPTIONS = {
  "animation": false,
  "responsive": true,
  "maintainAspectRatio": false,
  "title": {
    "display": false
  },
  "layout": {
    "padding": {
      "top": 0,
      "left": 10,
      "right": 10,
      "bottom": 0
    }
  },
  "legend": {
    "labels": {
      "fontSize": 11,
      "boxWidth": 22,
      "fontColor": "#333",
      "filter": function (item, chart) {
        return item.text.includes("Value");
      }
    }
  },
  "scales": {
    "xAxes": [
      {
        "barPercentage": 1.00,
        "categoryPercentage": 1.00,
        "gridLines": {
          "display": true
        },
        "ticks": {
          "fontSize": 11,
          "fontColor": "#333"
        },
        "scaleLabel": {
          "fontSize": 11,
          "display": true,
          "fontColor": "#333",
          "labelString": "Time Frame"
        }
      }
    ],
    "yAxes": [
      {
        "stacked": true,
        "id": "y-axis-v-1",
        "position": "left",
        "gridLines": {
          "display": true
        },
        "afterFit": function (e) {
          e.width = 58;
        },
        "scaleLabel": {
          "fontSize": 11,
          "display": true,
          "fontColor": "#333",
          "labelString": "Luminance"
        },
        "ticks": {
          "min": 0,
          "max": 255,
          "stepSize": 15,
          "fontSize": 11,
          "fontColor": "#555"
        },
      },
      {
        "stacked": true,
        "id": "y-axis-v-2",
        "position": "right",
        "gridLines": {
          "display": true
        },
        "afterFit": function (e) {
          e.width = 58;
        },
        "scaleLabel": {
          "fontSize": 11,
          "display": true,
          "fontColor": "#333",
          "labelString": "RGB Color"
        },
        "ticks": {
          "min": 0,
          "max": 255,
          "stepSize": 15,
          "fontSize": 11,
          "fontColor": "#555"
        }
      },
      {
        "stacked": true,
        "display": false,
        "id": "y-axis-h-1",
        "position": "left",
        "gridLines": {
          "display": false
        },
        "ticks": {
          "min": 0,
          "max": 255,
          "fontSize": 11,
          "fontColor": "#333"
        }
      },
      {
        "stacked": true,
        "display": false,
        "id": "y-axis-h-2",
        "position": "left",
        "gridLines": {
          "display": false
        },
        "ticks": {
          "min": 0,
          "max": 255,
          "fontSize": 11,
          "fontColor": "#333"
        }
      },
      {
        "stacked": true,
        "display": false,
        "id": "y-axis-h-3",
        "position": "left",
        "gridLines": {
          "display": false
        },
        "ticks": {
          "min": 0,
          "max": 255,
          "fontSize": 11,
          "fontColor": "#333"
        }
      },
      {
        "stacked": true,
        "display": false,
        "id": "y-axis-h-4",
        "position": "left",
        "gridLines": {
          "display": false
        },
        "ticks": {
          "min": 0,
          "max": 255,
          "fontSize": 11,
          "fontColor": "#333"
        }
      },
      {
        "stacked": true,
        "display": false,
        "id": "y-axis-h-5",
        "position": "left",
        "gridLines": {
          "display": false
        },
        "ticks": {
          "min": 0,
          "max": 255,
          "fontSize": 11,
          "fontColor": "#333"
        }
      },
      {
        "stacked": true,
        "display": false,
        "id": "y-axis-h-6",
        "position": "left",
        "gridLines": {
          "display": false
        },
        "ticks": {
          "min": 0,
          "max": 255,
          "fontSize": 11,
          "fontColor": "#333"
        }
      },
      {
        "stacked": true,
        "display": false,
        "id": "y-axis-h-7",
        "position": "left",
        "gridLines": {
          "display": false
        },
        "ticks": {
          "min": 0,
          "max": 255,
          "fontSize": 11,
          "fontColor": "#333"
        }
      },
      {
        "stacked": true,
        "display": false,
        "id": "y-axis-h-8",
        "position": "left",
        "gridLines": {
          "display": false
        },
        "ticks": {
          "min": 0,
          "max": 255,
          "fontSize": 11,
          "fontColor": "#333"
        }
      },
      {
        "stacked": true,
        "display": false,
        "id": "y-axis-h-9",
        "position": "left",
        "gridLines": {
          "display": false
        },
        "ticks": {
          "min": 0,
          "max": 255,
          "fontSize": 11,
          "fontColor": "#333"
        }
      },
      {
        "stacked": true,
        "display": false,
        "id": "y-axis-h-10",
        "position": "left",
        "gridLines": {
          "display": false
        },
        "ticks": {
          "min": 0,
          "max": 255,
          "fontSize": 11,
          "fontColor": "#333"
        }
      }
    ]
  }
};