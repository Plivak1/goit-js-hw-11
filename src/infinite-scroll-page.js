import PixabayApiService from './js/pixabay-api';
import galleryMarkup from './js/gallery-markup';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const pixabayApiService = new PixabayApiService();
const { formEl, galleryEl } = {
  formEl: document.querySelector('.search-form'),
  galleryEl: document.querySelector('.gallery'),
};
let isPageLoad = true;

formEl.addEventListener('submit', onSubmitForm);

async function onSubmitForm(evt) {
  try {
    evt.preventDefault();
    pixabayApiService.query =
      evt.currentTarget.elements.searchQuery.value.trim();
    if (pixabayApiService.query === '') {
      return;
    }
    const resetPage = await pixabayApiService.resetPage();
    const removeGalleryMarkup = await removeGallery();
    const response = await pixabayApiService.getPictures(
      pixabayApiService.query
    );
    const pictures = await response.data.hits;
    const totalPictures = await response.data.totalHits;
    Notify.info(`Hooray! We found ${totalPictures} images.`);
    if (pictures.length === 0) {
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    const markup = await galleryMarkup(pictures);
    const gallery = await createGallery(markup);
    const lastEl = await document.querySelector('.img:last-child');
    isPageLoad = true;
    if (isPageLoad) {
      const observe = await observeLastEl(lastEl);
      isPageLoad = false;
    }
    if (pictures.length < 39) {
      infiniteScroll.unobserve(lastEl);
    }
    const scroll = await startSmoothScroll();
  } catch (error) {
    console.log(error);
  }
}

async function createGallery(markup) {
  const createMarkup = await galleryEl.insertAdjacentHTML('beforeend', markup);

  let gallery = new SimpleLightbox('.gallery a');
  gallery.on('show.simplelightbox');
}

async function removeGallery() {
  const remove = await (galleryEl.innerHTML = '');
  return remove;
}

async function startSmoothScroll() {
  const { height: cardHeight } = document
    .querySelector('body')
    .firstElementChild.getBoundingClientRect();

  const scroll = await window.scrollBy({
    top: cardHeight,
    behavior: 'smooth',
  });
}

async function showMoreImg() {
  try {
    const response = await pixabayApiService.getPictures(
      pixabayApiService.query
    );
    const pictures = await response.data.hits;
    const markup = await galleryMarkup(pictures);
    const gallery = await createGallery(markup);
    const lastEl = await document.querySelector('.img:last-child');
    isPageLoad = true;
    if (isPageLoad) {
      observeLastEl(lastEl);
      isPageLoad = false;
    }
    if (pictures.length < 39) {
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
      infiniteScroll.unobserve(lastEl);
    }
  } catch (error) {
    console.log(error);
  }
}

async function observeLastEl(element) {
  infiniteScroll.observe(element);
}

const infiniteScrollCallback = (entries, observer) => {
  const entry = entries[0];
  if (!entry.isIntersecting) return;
  showMoreImg();
  observer.unobserve(entry.target);
};
const infiniteScroll = new IntersectionObserver(infiniteScrollCallback, {});
