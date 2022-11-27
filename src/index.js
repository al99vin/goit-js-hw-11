import axios from "axios";
import SimpleLightbox from "simplelightbox";
import { Notify } from 'notiflix/build/notiflix-notify-aio';


const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

refs.loadMore.style.display = 'none';
let alreadyShown = 0;
let page = 1;

refs.form.addEventListener('submit', onFormSubmit);

refs.loadMore.addEventListener('click', onLoadMoreClick);

function onLoadMoreClick() {
  refs.loadMore.style.display = 'none';
  page += 1;
  const name = refs.form.querySelector('input').value.trim();
  loadFromAPI(name, page);
  refs.loadMore.style.display = 'flex';
}

refs.form.querySelector('input');

function onFormSubmit(e) {
  e.preventDefault();
  alreadyShown = 0;
  refs.gallery.innerHTML = '';
  const name = refs.form.querySelector('input').value.trim();

  if (name !== '') {
    loadFromAPI(name);
  } else {
    refs.loadMore.style.display = 'none';
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

async function loadFromAPI(name, page) {
  const BASE_URL = 'https://pixabay.com/api/';

  const options = {
    params: {
      key: '31598622-f1e48b8e3d2e483874487f705',
      q: name,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: page,
      per_page: 40,
    },
  };

  try {
    const response = await axios.get(BASE_URL, options);
    alreadyShown += response.data.hits.length;

    message(
      response.data.hits.length,
      alreadyShown,
      options.params.per_page,
      response.data.total
    );

    renderGallery(response.data);
  } catch (error) {
    console.log(error);
  }
}
function renderGallery(picture) {
  const markup = picture.hits
    .map(
      hit => `<a class="gallery__link" href="${hit.largeImageURL}">
        <div class="photo-card">
    <img src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        ${hit.likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${hit.views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${hit.comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${hit.downloads}
      </p>
    </div>
  </div>
  </a>`
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  simpleLightBox.refresh();
}

const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 150,
});

function message(length, alreadyShown, per_page, total) {
  if (!length) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  if (length >= alreadyShown) {
    refs.loadMore.style.display = 'flex';
    Notify.info(`Hooray! We found ${total} images.`);
  }
  if (alreadyShown >= total) {
    refs.loadMore.style.display = 'none';
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
}