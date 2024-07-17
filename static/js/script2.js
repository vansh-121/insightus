const toggle_button = document.querySelector(".toggle_button");
const toggle_button_icon = document.querySelector(".toggle_button i");
const dropdown_menu = document.querySelector(".dropdown_menu");

toggle_button.onclick = function () {
  dropdown_menu.classList.toggle("open");
  const isOpen = dropdown_menu.classList.contains("open");

  toggle_button_icon.classList = isOpen
    ? "fa-solid fa-xmark"
    : "fa-solid fa-bars";
};

let notifications = document.querySelector(".notifications");

function createToast(type, icon, title, text, timeOut) {
  let newToast = document.createElement("div");
  newToast.innerHTML = `
          <div class="toast ${type}">
          <i class="${icon}"></i>
          <div class="content">
            <div class="title">${title}</div>
            <span id="success">${text}</span>
          </div>
          <i class="fa-solid fa-xmark"
          onclick="(this.parentElement).remove()"
          ></i>
        </div>`;
  notifications.appendChild(newToast);
  newToast.timeOut = setTimeout(() => newToast.remove(), timeOut);
}

function showSections(section) {
  var sections = document.getElementsByClassName(section);
  for (var i = 0; i < sections.length; i++) {
    sections[i].style.display = "flex";
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  const links = document.querySelectorAll(".insights");
  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
    });
  });
});

document.addEventListener("DOMContentLoaded", (event) => {
  var processingStatus = localStorage.getItem("processingStatus");
  if (processingStatus === "success") {
    createToast(
      "success",
      "fa-solid fa-circle-check",
      "Success",
      "Filled Missing Value Successfully!",
      10000
    );
    document.querySelectorAll(".insight_content").forEach(function (element) {
      element.remove();
    });
    let loading = document.getElementsByClassName("loading");
    loading[0].style.display = "flex";
    $.ajax({
      type: "GET",
      url: "/insight.html/describe_stats",
      success: function (response) {
        if (response.result === "success") {
          loading[0].style.display = "none";
          showSections("section1");
          var stats = response.stats.replace(/\n/g, "<br/>");
          var skew = response.skew.replace(/\n/g, "<br/>");
          $("#stats-container").html(stats);
          $("#skew-container").html(skew);
          loading[1].style.display = "flex";
          $.ajax({
            url: "/insight.html/frequency_plots",
            method: "GET",
            success: function (response) {
              if (response.result === "success") {
                loading[1].style.display = "none";
                showSections("section2");
                var img = document.createElement("img");
                img.src = "data:image/png;base64," + response.plot;
                img.alt = "Generated Plot";
                var graphContainer =
                  document.getElementById("graph-container1");
                graphContainer.innerHTML = "";
                graphContainer.appendChild(img);
                loading[2].style.display = "flex";
                $.ajax({
                  url: "/insight.html/distribution_plots",
                  method: "GET",
                  success: function (response) {
                    if (response.result === "success") {
                      loading[2].style.display = "none";
                      showSections("section3");
                      var img = document.createElement("img");
                      img.src = "data:image/png;base64," + response.plot;
                      img.alt = "Generated Plot";
                      var graphContainer =
                        document.getElementById("graph-container2");
                      graphContainer.innerHTML = "";
                      graphContainer.appendChild(img);
                      loading[3].style.display = "flex";
                      $.ajax({
                        url: "/insight.html/data_refining",
                        method: "GET",
                        success: function (response) {
                          if (response.result === "success") {
                            loading[3].style.display = "none";
                            createToast(
                              "success",
                              "fa-solid fa-circle-check",
                              "Success",
                              "Data Refining Successful!",
                              10000
                            );
                            createToast(
                              "info",
                              "fa-solid fa-circle-info",
                              "Training Models",
                              "Please Wait, It may Take around 10 minutes.",
                              15000
                            );
                            loading[4].style.display = "flex";
                            $.ajax({
                              url: "/insight.html/logistic_regression_insights",
                              method: "GET",
                              success: function (response) {
                                if (response.result === "success") {
                                  loading[4].style.display = "none";
                                  showSections("section4");
                                  var text = response.text.replace(
                                    /\n/g,
                                    "<br/>"
                                  );
                                  $("#text-container1").html(text);
                                  document.getElementById(
                                    "graphs"
                                  ).style.display = "block";
                                  var img = document.createElement("img");
                                  img.src =
                                    "data:image/png;base64," + response.plot;
                                  img.alt = "Generated Plot";
                                  var graphContainer =
                                    document.getElementById("graph-container3");
                                  graphContainer.innerHTML = "";
                                  graphContainer.appendChild(img);
                                  loading[5].style.display = "flex";
                                  $.ajax({
                                    url: "/insight.html/decisionTree_insights",
                                    method: "GET",
                                    success: function (response) {
                                      if (response.result === "success") {
                                        loading[5].style.display = "none";
                                        showSections("section5");
                                        var text = response.text.replace(
                                          /\n/g,
                                          "<br/>"
                                        );
                                        loading[6].style.display = "flex";
                                        $("#text-container2").html(text);
                                        $.ajax({
                                          url: "/insight.html/randomForest_insights",
                                          method: "GET",
                                          success: function (response) {
                                            if (response.result === "success") {
                                              loading[6].style.display = "none";
                                              showSections("section6");
                                              var text = response.text.replace(
                                                /\n/g,
                                                "<br/>"
                                              );
                                              $("#text-container3").html(text);
                                              loading[7].style.display = "flex";
                                              $.ajax({
                                                url: "/insight.html/kmeans_insights",
                                                method: "GET",
                                                success: function (response) {
                                                  if (
                                                    response.result ===
                                                    "success"
                                                  ) {
                                                    loading[7].style.display =
                                                      "none";
                                                    showSections("section7");
                                                    var text =
                                                      response.text.replace(
                                                        /\n/g,
                                                        "<br/>"
                                                      );
                                                    $("#text-container4").html(
                                                      text
                                                    );
                                                    var img =
                                                      document.createElement(
                                                        "img"
                                                      );
                                                    img.src =
                                                      "data:image/png;base64," +
                                                      response.plot;
                                                    img.alt = "Generated Plot";
                                                    var graphContainer =
                                                      document.getElementById(
                                                        "graph-container4"
                                                      );
                                                    graphContainer.innerHTML =
                                                      "";
                                                    graphContainer.appendChild(
                                                      img
                                                    );
                                                    createToast(
                                                      "success",
                                                      "fa-solid fa-circle-check",
                                                      "Success",
                                                      "All Insights are shown Successfully!",
                                                      10000
                                                    );
                                                  } else {
                                                    loading[7].style.display =
                                                      "none";
                                                    createToast(
                                                      "warning",
                                                      "fa-solid fa-triangle-exclamation",
                                                      "Failure",
                                                      response.error,
                                                      10000
                                                    );
                                                  }
                                                },
                                                error: function (
                                                  xhr,
                                                  status,
                                                  error
                                                ) {
                                                  loading[7].style.display =
                                                    "none";
                                                  console.error(error);
                                                  createToast(
                                                    "error",
                                                    "fa-solid fa-circle-xmark",
                                                    "Error",
                                                    "Some Error Occured!",
                                                    10000
                                                  );
                                                },
                                              });
                                            } else {
                                              loading[6].style.display = "none";
                                              createToast(
                                                "warning",
                                                "fa-solid fa-triangle-exclamation",
                                                "Failure",
                                                response.error,
                                                10000
                                              );
                                            }
                                          },
                                          error: function (xhr, status, error) {
                                            loading[6].style.display = "none";
                                            console.error(error);
                                            createToast(
                                              "error",
                                              "fa-solid fa-circle-xmark",
                                              "Error",
                                              "Some Error Occured!",
                                              10000
                                            );
                                          },
                                        });
                                      } else {
                                        loading[5].style.display = "none";
                                        createToast(
                                          "warning",
                                          "fa-solid fa-triangle-exclamation",
                                          "Failure",
                                          response.error,
                                          10000
                                        );
                                      }
                                    },
                                    error: function (xhr, status, error) {
                                      loading[5].style.display = "none";
                                      console.error(error);
                                      createToast(
                                        "error",
                                        "fa-solid fa-circle-xmark",
                                        "Error",
                                        "Some Error Occured!",
                                        10000
                                      );
                                    },
                                  });
                                } else if (response.result === "linear") {
                                  $.ajax({
                                    url: "/insight.html/linear_regression_insights",
                                    method: "GET",
                                    success: function (response) {
                                      if (response.result === "success") {
                                        loading[4].style.display = "none";
                                        showSections("section4");
                                        var text = response.text.replace(
                                          /\n/g,
                                          "<br/>"
                                        );
                                        $("#text-container1").html(text);
                                        loading[7].style.display = "flex";
                                        $.ajax({
                                          url: "/insight.html/kmeans_insights",
                                          method: "GET",
                                          success: function (response) {
                                            if (response.result === "success") {
                                              loading[7].style.display = "none";
                                              showSections("section7");
                                              var text = response.text.replace(
                                                /\n/g,
                                                "<br/>"
                                              );
                                              $("#text-container4").html(text);
                                              var img =
                                                document.createElement("img");
                                              img.src =
                                                "data:image/png;base64," +
                                                response.plot;
                                              img.alt = "Generated Plot";
                                              var graphContainer =
                                                document.getElementById(
                                                  "graph-container4"
                                                );
                                              graphContainer.innerHTML = "";
                                              graphContainer.appendChild(img);
                                              createToast(
                                                "success",
                                                "fa-solid fa-circle-check",
                                                "Success",
                                                "All Insights are shown Successfully!",
                                                10000
                                              );
                                            } else {
                                              loading[7].style.display = "none";
                                              createToast(
                                                "warning",
                                                "fa-solid fa-triangle-exclamation",
                                                "Failure",
                                                response.error,
                                                10000
                                              );
                                            }
                                          },
                                          error: function (xhr, status, error) {
                                            loading[7].style.display = "none";
                                            console.error(error);
                                            createToast(
                                              "error",
                                              "fa-solid fa-circle-xmark",
                                              "Error",
                                              "Some Error Occured!",
                                              10000
                                            );
                                          },
                                        });
                                      } else {
                                        loading[4].style.display = "none";
                                        createToast(
                                          "warning",
                                          "fa-solid fa-triangle-exclamation",
                                          "Failure",
                                          response.error,
                                          10000
                                        );
                                      }
                                    },
                                    error: function (xhr, status, error) {
                                      loading[4].style.display = "none";
                                      console.error(error);
                                      createToast(
                                        "error",
                                        "fa-solid fa-circle-xmark",
                                        "Error",
                                        "Some Error Occured!",
                                        10000
                                      );
                                    },
                                  });
                                } else {
                                  loading[4].style.display = "none";
                                  createToast(
                                    "warning",
                                    "fa-solid fa-triangle-exclamation",
                                    "Failure",
                                    response.error,
                                    10000
                                  );
                                }
                              },
                              error: function (xhr, status, error) {
                                loading[4].style.display = "none";
                                console.error(error);
                                createToast(
                                  "error",
                                  "fa-solid fa-circle-xmark",
                                  "Error",
                                  "Some Error Occured!",
                                  10000
                                );
                              },
                            });
                          } else {
                            loading[3].style.display = "none";
                            createToast(
                              "warning",
                              "fa-solid fa-triangle-exclamation",
                              "Failure",
                              response.error,
                              10000
                            );
                          }
                        },
                        error: function (xhr, status, error) {
                          loading[3].style.display = "none";
                          console.error(error);
                          createToast(
                            "error",
                            "fa-solid fa-circle-xmark",
                            "Error",
                            "Some Error Occured!",
                            10000
                          );
                        },
                      });
                    } else {
                      loading[2].style.display = "none";
                      createToast(
                        "warning",
                        "fa-solid fa-triangle-exclamation",
                        "Failure",
                        response.error,
                        10000
                      );
                    }
                  },
                  error: function (xhr, status, error) {
                    loading[2].style.display = "none";
                    console.error("Error Fetching Plots: ", error);
                    createToast(
                      "error",
                      "fa-solid fa-circle-xmark",
                      "Error",
                      "Some Error Occured!",
                      10000
                    );
                  },
                });
              } else {
                loading[1].style.display = "none";
                createToast(
                  "warning",
                  "fa-solid fa-triangle-exclamation",
                  "Failure",
                  response.error,
                  10000
                );
              }
            },
            error: function (xhr, status, error) {
              loading[1].style.display = "none";
              console.error("Error Fetching Plots: ", error);
              createToast(
                "error",
                "fa-solid fa-circle-xmark",
                "Error",
                "Some Error Occured!",
                10000
              );
            },
          });
        } else {
          loading[0].style.display = "none";
          createToast(
            "warning",
            "fa-solid fa-triangle-exclamation",
            "Failure",
            response.error,
            10000
          );
        }
      },
      error: function (xhr, status, error) {
        loading[0].style.display = "none";
        console.error(error);
        createToast(
          "error",
          "fa-solid fa-circle-xmark",
          "Error",
          "Some Error Occured!",
          10000
        );
      },
    });
    localStorage.removeItem("processingStatus");
  }
});
