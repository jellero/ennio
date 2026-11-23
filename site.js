const gallery = document.querySelector(".gallery");
const photos = Array.from(gallery.querySelectorAll("figure"));
const filters = document.querySelector(".filters");
const filterButtons = Array.from(filters.querySelectorAll("button"));
const results = document.querySelector("#risultati");

filters.hidden = false;
for (const button of filterButtons) {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    for (const filter of filterButtons) {
      filter.setAttribute("aria-pressed", String(filter === button));
    }
    for (const photo of photos) {
      photo.hidden = category !== "all" && photo.dataset.category !== category;
    }
    const count = photos.filter((photo) => !photo.hidden).length;
    results.textContent = count === 1 ? "1 fotografia" : count + " fotografie";
  });
}

const photoDialog = document.querySelector("#photo-dialog");
const photoImage = document.querySelector("#photo-image");
const photoCaption = document.querySelector("#photo-caption");
const photoPosition = document.querySelector("#photo-position");
const previous = document.querySelector("#photo-prev");
const next = document.querySelector("#photo-next");

let visiblePhotos = [];
let activePhoto = 0;

function showPhoto(index) {
  activePhoto = (index + visiblePhotos.length) % visiblePhotos.length;
  const photo = visiblePhotos[activePhoto];
  photoImage.src = photo.querySelector("a").href;
  photoImage.alt = photo.querySelector("img").alt;
  photoCaption.textContent = photo.querySelector("figcaption").firstChild.textContent.trim();
  photoPosition.textContent = (activePhoto + 1) + " / " + visiblePhotos.length;
}

function shouldOpenDialog(event, dialog) {
  return typeof dialog.showModal === "function" && event.button === 0
    && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
}

gallery.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link || !shouldOpenDialog(event, photoDialog)) return;
  event.preventDefault();
  visiblePhotos = photos.filter((photo) => !photo.hidden);
  previous.disabled = visiblePhotos.length < 2;
  next.disabled = previous.disabled;
  showPhoto(visiblePhotos.indexOf(link.closest("figure")));
  photoDialog.showModal();
});

previous.addEventListener("click", () => showPhoto(activePhoto - 1));
next.addEventListener("click", () => showPhoto(activePhoto + 1));
photoDialog.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  showPhoto(activePhoto + (event.key === "ArrowLeft" ? -1 : 1));
});

const filmDialog = document.querySelector("#film-dialog");
const filmPlayer = document.querySelector("#film-player");
const filmTitle = document.querySelector("#film-dialog-title");
const filmExternal = document.querySelector("#film-external");

for (const card of document.querySelectorAll(".film-card")) {
  card.addEventListener("click", (event) => {
    if (!shouldOpenDialog(event, filmDialog)) return;
    event.preventDefault();
    filmTitle.textContent = card.querySelector(".film-name").firstChild.textContent.trim();
    filmExternal.href = card.href;

    const player = document.createElement("iframe");
    player.title = filmTitle.textContent;
    player.src = "https://www.youtube-nocookie.com/embed/" + card.dataset.video + "?autoplay=1&playsinline=1&rel=0";
    player.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    player.allowFullscreen = true;
    player.referrerPolicy = "strict-origin-when-cross-origin";
    filmPlayer.replaceChildren(player);
    filmDialog.showModal();
  });
}

filmDialog.addEventListener("close", () => filmPlayer.replaceChildren());

for (const dialog of [photoDialog, filmDialog]) {
  dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom) {
      dialog.close();
    }
  });
}
