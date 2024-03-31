console.log("js");

let songs;
let playlists;
let currentsong = new Audio();

function convertSecondsToMinutesAndSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.floor(seconds % 60);

  // Add leading zeros if necessary
  var minutesString = minutes.toString().padStart(2, "0");
  var secondsString =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return minutesString + ":" + secondsString;
}

async function getPlaylist(dir = "Song") {
  let a = await fetch(dir);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let _playlists = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.replace(location.href, "").startsWith(dir + "/")) {
      _playlists.push({
        image: element.href + "/cover.png",
        url: element.href,
        title: element.title,
      });
    }
  }
  return _playlists;
}

async function getSongs(playlist_url) {
  let a = await fetch(playlist_url);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push({
        url: element.href,
        title: element.title.split(".")[0],
      });
    }
  }
  return songs;
}

const updateSVG = (svg_src, index, prev_idx) => {
  if (prev_idx !== undefined)
    document.querySelector(`img#song-img-${prev_idx}`).src = "img/play.svg";

  document.querySelector(`img#song-img-${index}`).src = svg_src;
  document.querySelector(`#masterplay`).src = svg_src;
};

const newSong = async (idx, prevIndex) => {
  currentsong.src = songs[idx].url;
  currentsong.index = idx;
  document.querySelector(".songinfo").innerHTML = songs[idx].title;
  document.querySelector(".songtime").innerHTML = "00:00/00:00";

  await new Promise((res, rej) => {
    currentsong.onloadeddata = async () => {
      await currentsong.play();
      res();
    };
  });

  updateSVG("img/pause.svg", idx, prevIndex);
};

const handlePlay = async (index = currentsong.index) => {
  if (index == undefined) {
    newSong(0);
    return;
  }

  if (currentsong.index === index) {
    if (currentsong.paused) {
      await currentsong.play();
      updateSVG("img/pause.svg", index);
    } else {
      currentsong.pause();
      updateSVG("img/play.svg", index);
    }
  } else {
    const prevIndex = currentsong.index;
    newSong(index, prevIndex);
  }
};

const handleSongNavigation = (method) => {
  const nextIndex = currentsong.index + method;
  if (nextIndex >= 0 && nextIndex < songs.length) handlePlay(nextIndex);
};

// const playmusic = (track) => {
// currentsong.src = "/Song/" + track;
// currentsong.play();

// const masterPlay = document.getElementById("masterplay");
// masterPlay.src = "pause.svg";
// };

// const xyz = (e) => {
//   e.preventDefault()
// }

const loadPlaylist = async (index) => {
  songs = await getSongs(playlists?.[index]?.url);

  let songul = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];

  let count = 0;
  songul.innerHTML = "";

  for (const song of songs) {
    songul.innerHTML += `<div onclick="handlePlay(${count})">
      <li>
        <img class="invert" src="img/music.svg" alt="" />

        <div class="info">
          <div>${song.title}</div>
        </div>

        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" id="song-img-${count++}" src="img/play.svg" alt="" />
        </div>
      </li>
    </div>`;
  }
  // handlePlay(songs[0 ])

  // Array.from(
  //   document.querySelector(".songlist").getElementsByTagName("li")
  // ).forEach((e) => {
  //   e.addEventListener("click", (element) => {
  //     playmusic(e.querySelector("div").firstElementChild.innerHTML.trim());
  //   });
  // });
  currentsong.addEventListener("timeupdate", () => {
    console.log(currentsong.currentTime, currentsong.duration);
    document.querySelector(
      ".songtime"
    ).innerHTML = `${convertSecondsToMinutesAndSeconds(
      currentsong.currentTime
    )}/${convertSecondsToMinutesAndSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });
  // event listener for seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });
  //  event listener for hamburger
  document.querySelector(".hamcont").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  // event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  // prev and next
  // prev.addEventListener("click", () => {
  //   console.log(currentsong);
  // });
  // next.addEventListener("click", () => {
  //   console.log(currentsong.src.split("/").slice(-1)[0]);
  //   // let nex = songs.indexOf(currentsong.src.split("/").slice(-1)[0])

  //   // console.log(songs,nex)
  // });
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentsong.volume = parseInt(e.target.value) / 100;
    });
};

async function main() {
  playlists = await getPlaylist();

  let playlistHtml = document.querySelector(".cardcontainer");
  let count = 0;

  for (const playlist of playlists) {
    playlistHtml.innerHTML += `
    <div class="card" onclick="loadPlaylist(${count++})">
      <div class="play">
        <svg
          data-encore-id="icon"
          role="img"
          aria-hidden="true"
          viewBox="0 0 24 24"
          class="Svg-sc-ytk21e-0 bneLcE"
        >
          <path
            d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"
          ></path>
        </svg>
      </div>

      <div class="play-cover">
        <img
          src="${playlist.image}"
          alt="playlist-cover"/>
      </div>
      <h3>${playlist.title}</h3>
      <p></p>
    </div>
    `;
  }

  await loadPlaylist(0)
}

main();

// const handleMasterPlay = (event) => {
//   if (currentsong.paused) {
//     currentsong.play().then(() => console.log("Playing"));
//     event.target.src = "pause.svg";
//   } else {
//     currentsong.pause();
//     event.target.src = "play.svg";
//   }
// };

// let music = new Audio('Song/1.mp3')
// let songindex =0
// let masterplay = document.getElementById('masterplay')
// let seekbar =document.getElementById('seekbar')

// let songs = [
//   {songname:"arjan valley",filePath:"Song/1.mp3"},
//   {songname:"arjan valley",filePath:"Song/2.mp3"},
//   {songname:"arjan valley",filePath:"Song/3.mp3"},
//   {songname:"arjan valley",filePath:"Song/4.mp3"}
// ]
// // music.play()
// masterplay.addEventListener('click',()=>{
//   if(music.paused || music.currentTime<=0){
//     music.play();
//     masterplay.src="pause.svg"
//     // masterplay.classList.remove('fa-play')
//     // masterplay.classList.add('fa-pause')
//   }
//   else{
//     music.pause();
//     masterplay.src="play.svg"
//     // masterplay.classList.remove('fa-pause')
//     // masterplay.classList.add('fa-play')
//   }
// })
// document.querySelector(".songtime").innerHTML="00:00/00:00"
// // music.addEventListener("loadeddata",()=>{
// //   let duration = music.duration
// //   console.log(duration)
// // })
