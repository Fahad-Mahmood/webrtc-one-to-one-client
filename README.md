[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">WebRTC One-to-One Video Chat</h3>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

A simple one-to-one video chat application developed using webrtc mesh architecture. 

Primary features include:

* Ability to create and join different rooms.
* Selection of audio/video devices for video chat.
* Media processing and audio voice filtering.


<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

Following Tech Stack is used in the project:

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![Typescript][Typescript]][Typescript-url]
* [![Mui][Mui]][Mui-url]
* [![Socket][Socket]][Socket-url]



<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

Make sure the signaling server is installed and running. To find more details, check the [github repository](https://github.com/Fahad-Mahmood/webrtc-one-to-one-server).

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Fahad-Mahmood/webrtc-one-to-one-client.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Enter Signaling URL in `.env.local`
   ```js
   const NEXT_PUBLIC_SOCKET_SERVER = 'ENTER SIGNALING SERVER URL';
   ```
4. Run application using `npm run dev` in the terminal

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [ ] Voice or Video mute and unmute during the call
- [ ] Setup screen sharing feature on call
- [ ] Use of twilio turn server for instead of google stun
- [ ] Show statistics durnig call for example bitrate.

See the [open issues](https://github.com/othneildrew/Best-README-Template/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. 
<p align="right">(<a href="#readme-top">back to top</a>)</p>




<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/Fahad-Mahmood/webrtc-one-to-one-client?style=for-the-badge
[contributors-url]: https://github.com/Fahad-Mahmood/webrtc-one-to-one-client/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Fahad-Mahmood/webrtc-one-to-one-client?style=for-the-badge
[forks-url]: https://github.com/Fahad-Mahmood/webrtc-one-to-one-client/network/members
[stars-shield]: https://img.shields.io/github/stars/Fahad-Mahmood/webrtc-one-to-one-client?style=for-the-badge
[stars-url]: https://github.com/Fahad-Mahmood/webrtc-one-to-one-client/stargazers
[issues-shield]: https://img.shields.io/github/issues/Fahad-Mahmood/webrtc-one-to-one-client?style=for-the-badge
[issues-url]: https://github.com/Fahad-Mahmood/webrtc-one-to-one-client/issues
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Mui]:https://img.shields.io/static/v1?style=for-the-badge&message=MUI&color=007FFF&logo=MUI&logoColor=FFFFFF&label=
[Mui-url]: https://mui.com/
[Typescript]: https://img.shields.io/static/v1?style=for-the-badge&message=TypeScript&color=3178C6&logo=TypeScript&logoColor=FFFFFF&label=
[Typescript-url]: https://www.typescriptlang.org/
[Socket]: https://img.shields.io/static/v1?style=for-the-badge&message=Socket.io&color=010101&logo=Socket.io&logoColor=FFFFFF&label=
[Socket-url]: https://socket.io/
