// Typing Animation for Title
const title = "Hey! I'm Claire~";
const typingElement = document.getElementById("typing-title");
let index = 0;

const typeTitle = () => {
  if (index < title.length) {
    typingElement.textContent += title.charAt(index);
    index++;
    setTimeout(typeTitle, 100); // Typing speed (100ms per character)
  }
};

typeTitle();

// Scroll-Appearing Effect
const scrollElements = document.querySelectorAll(".scroll-animate");

const checkScroll = () => {
  scrollElements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (elementTop < windowHeight - 100) {
      element.classList.add("visible");
    }
  });
};

window.addEventListener("scroll", checkScroll);
window.addEventListener("load", checkScroll); // Trigger on page load


const carouselTrack = document.querySelector(".carousel-track");

carouselTrack.addEventListener("mouseenter", () => {
  carouselTrack.style.animationPlayState = "paused";
});

carouselTrack.addEventListener("mouseleave", () => {
  carouselTrack.style.animationPlayState = "running";
});

document.querySelectorAll('.item[data-photo]').forEach(item => {
  const src = item.dataset.photo;
  const caption = item.dataset.caption || '';
  const div = document.createElement('div');
  div.className = 'item-photo-hover';
  div.innerHTML = `<img src="${src}" alt="${caption}" /><div class="photo-caption">${caption}</div>`;
  item.appendChild(div);
});

document.querySelectorAll('.item').forEach(item => {
  const link = item.querySelector('h3 a');
  if (!link) return;
  item.style.cursor = 'pointer';
  item.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') return; // let real links handle themselves
    window.open(link.href, link.target || '_self');
  });
});