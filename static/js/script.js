localStorage.setItem("processingStatus", "failure");
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

document.addEventListener("DOMContentLoaded", (event) => {
  const links = document.querySelectorAll(".home");
  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
    });
  });
});

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

let browse = document.getElementById("browse_button");
browse.onclick = function () {
  let type = "info";
  let icon = "fa-solid fa-circle-info";
  let title = "Loading";
  let text = "Please Wait, It may Take Some Time.";
  createToast(type, icon, title, text, 15000);
};

$(document).ready(function () {
  $("#browse_button").click(function (event) {
    event.preventDefault();
    $.ajax({
      type: "POST",
      url: "/browse_file",
      success: function (response) {
        if (response.result === "success") {
          $("#csv_file").val(response.file_name);
          $("#csv_file").removeClass("glow_red");
          $("#csv_file").addClass("glow_green");
          setTimeout(function () {
            $("#csv_file").removeClass("glow_green");
          }, 10000);
          createToast(
            "success",
            "fa-solid fa-circle-check",
            "Success",
            "File " + response.file_name + " Uploaded Successfully.",
            10000
          );
        } else {
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
        console.error("Error: ", error);
        createToast(
          "error",
          "fa-solid fa-circle-xmark",
          "Error",
          "Some Error Occured!",
          10000
        );
      },
    });
  });
});

let upload = document.getElementById("upload_button");
upload.onclick = function () {
  let type = "info";
  let icon = "fa-solid fa-circle-info";
  let title = "Loading";
  let text = "Please Wait, It may Take Some Time.";
  createToast(type, icon, title, text, 15000);
};

$(document).ready(function () {
  $("#upload_button").click(function () {
    var inputValue = $("#csv_file").val();
    $.ajax({
      type: "POST",
      url: "/file_input",
      data: JSON.stringify({ input_value: inputValue }),
      contentType: "application/json",
      success: function (response) {
        if (response.result === "success") {
          $("#csv_file").removeClass("glow_red");
          $("#csv_file").addClass("glow_green");
          setTimeout(function () {
            $("#csv_file").removeClass("glow_green");
          }, 10000);
          createToast(
            "success",
            "fa-solid fa-circle-check",
            "Success",
            "File " + inputValue + " Uploaded Successfully.",
            10000
          );
        } else {
          $("#csv_file").removeClass("glow_green");
          $("#csv_file").addClass("glow_red");
          setTimeout(function () {
            $("#csv_file").removeClass("glow_red");
          }, 10000);
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
        console.error("Error: ", error);
        createToast(
          "error",
          "fa-solid fa-circle-xmark",
          "Error",
          "Some Error Occured!",
          10000
        );
      },
    });
  });
});

$(document).ready(function () {
  $("#insights_button").click(function (event) {
    event.preventDefault();
    var inputText = $("#target_column").val();
    $.ajax({
      type: "POST",
      url: "/get_target",
      data: { input_text: inputText },
      success: function (response) {
        if (response.result === "success") {
          $("#target_column").removeClass("glow_red");
          $("#target_column").addClass("glow_green");
          setTimeout(function () {
            $("#target_column").removeClass("glow_green");
          }, 10000);
          createToast(
            "success",
            "fa-solid fa-circle-check",
            "Success",
            "Target Column named '" + inputText + "' Exists.",
            10000
          );
          createToast(
            "info",
            "fa-solid fa-circle-info",
            "Filling Missing Values",
            "Please Wait, It may Take Some Time.",
            15000
          );
          $.ajax({
            type: "POST",
            url: "/fill_missing_values",
            contentType: "application/json",
            success: function (response) {
              if (response.result === "success") {
                localStorage.setItem("processingStatus", "success");
                window.location.href = "/insight.html";
              } else {
                console.log(response.error);
                createToast(
                  "error",
                  "fa-solid fa-circle-xmark",
                  "Error",
                  "Error Occured While Filling Missing Values!",
                  10000
                );
              }
            },
            error: function (xhr, status, error) {
              alert("Some Error Occured!");
              console.error("Error:", error);
            },
          });
        } else {
          $("#target_column").removeClass("glow_green");
          $("#target_column").addClass("glow_red");
          setTimeout(function () {
            $("#csv_file").removeClass("glow_red");
          }, 10000);
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
        console.error("Error: ", error);
        createToast(
          "error",
          "fa-solid fa-circle-xmark",
          "Error",
          "Some Error Occured!",
          10000
        );
      },
    });
  });
});
