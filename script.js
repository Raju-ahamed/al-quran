const surahSelect = document.getElementById('surahSelect');
const versesDiv = document.getElementById('verses');
const audio = document.getElementById('audio');
const autoBtn = document.getElementById('autoPlayBtn');
const fullQuranBtn = document.getElementById('fullQuranBtn');

let autoPlay = false;
let currentSurah = 1;
let currentAyah = 1;
let currentVerses = {};

// সূরার লিস্ট লোড (আপনার data/surahs.json)
fetch('data/surahs.json')
  .then(r => r.json())
  .then(data => {
    data.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.index;
      opt.textContent = `${s.index}. ${s.title} (${s.titleAr}) - ${s.count} আয়াত`;
      surahSelect.appendChild(opt);
    });
    loadSurah('1'); // শুরুতে আল-ফাতিহা
  })
  .catch(() => versesDiv.innerHTML = '<p style="color:red">data/surahs.json পাওয়া যায়নি!</p>');

// সূরা লোড — আপনার ফাইলের নাম ঠিক surah_1.json, surah_2.json এর মতো
function loadSurah(num) {
  const filename = `surah_${parseInt(num)}.json`;  // surah_1.json, surah_2.json ...
  fetch(`surah/${filename}`)
    .then(r => {
      if (!r.ok) throw new Error('Not found');
      return r.json();
    })
    .then(data => {
      currentSurah = parseInt(num);
      currentVerses = data;
      showVerses();
      playAudio(currentSurah, 1);
    })
    .catch(() => {
      versesDiv.innerHTML = `<p style="color:red">${filename} পাওয়া যায়নি!</p>`;
    });
}

// আয়াত দেখানো
function showVerses() {
  versesDiv.innerHTML = '';
  const verses = currentVerses.verse || {};
  const count = currentVerses.count || 0;
  for (let i = 1; i <= count; i++) {
    const key = 'verse_' + i;
    const text = verses[key] || 'আয়াত ' + i;
    const div = document.createElement('div');
    div.className = 'verse';
    div.innerHTML = `<div class="arabic">${text} ﴿${i}﴾</div><div class="ayah-num">আয়াত ${i}</div>`;
    div.onclick = () => playAudio(currentSurah, i);
    versesDiv.appendChild(div);
  }
}

// অডিও চালানো
function playAudio(s, a) {
  currentAyah = a;
  const ss = String(s).padStart(3, '0');
  const aa = String(a).padStart(3, '0');
  const local = `audio/${ss}/${ss}${aa}.mp3`;
  
  fetch(local, {method: 'HEAD'})
    .then(r => {
      audio.src = r.ok ? local : `https://everyayah.com/data/Alafasy_128kbps/${ss}${aa}.mp3`;
      audio.play().catch(() => {});
    })
    .catch(() => {
      audio.src = `https://everyayah.com/data/Alafasy_128kbps/${ss}${aa}.mp3`;
      audio.play().catch(() => {});
    });
}

// অটো প্লে
audio.addEventListener('ended', () => {
  if (autoPlay && currentAyah < currentVerses.count) {
    playAudio(currentSurah, currentAyah + 1);
  }
});

autoBtn.addEventListener('click', () => {
  autoPlay = !autoPlay;
  autoBtn.classList.toggle('active', autoPlay);
  autoBtn.textContent = autoPlay ? 'অটো প্লে চালু' : 'অটো প্লে বন্ধ';
});

// আল-কুরআন বাটন — PDF খুলবে
fullQuranBtn.addEventListener('click', () => {
  window.open('assets/কুরআন.pdf', '_blank');
});

// সূরা চেঞ্জ
surahSelect.addEventListener('change', () => loadSurah(surahSelect.value));