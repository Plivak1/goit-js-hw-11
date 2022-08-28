export default async function galleryMarkup(pictures) {
  const markup = await pictures.map(picture => {
    const {
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    } = picture;
    const markupString = `<a class="img" href="${largeImageURL}">
    <div class="photo-card">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
    <p class="info-item">
      <b>Likes<br /><span>${likes}</span></b>
    </p>
    <p class="info-item">
      <b>Views<br /><span>${views}</span></b>
    </p>
    <p class="info-item">
      <b>Comments<br /><span>${comments}</span></b>
    </p>
    <p class="info-item">
      <b>Downloads<br /><span>${downloads}</span></b>
    </p>
  </div>
</div></a>`;
    return markupString;
  });
  return markup.join(' ');
}
