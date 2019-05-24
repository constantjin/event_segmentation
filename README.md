# Event Segmentation Paradigm
Event Segmentation Paradigm using movie files. Developed by Node.js and JavaScript.

## Usage

### Install dependencies
Clone this repository.
Open a terminal from the project directory and run:

```bash
npm install
```

### Preparing video files
For the copyright issues, I excluded video files used in the our experiment.
Therefore, please prepare your own video files and follow the guide below:

 1. **Encode the video file**: Your video would be played on a web browser (i.e., Google Chrome). Therefore, the videos should be converted into a supported video format. I recommend encoding video files into **MP4 H.264 (ACC audio)**. 
 2. **Rename the video file**: Rename all video files in a format like **[number].mp4** (e.g., 1.mp4, 5.mp4, ...).
 3.  **Place videos inside the static file directory**: Create a directory named **"videos"** inside the *./files* directory. Place all video files inside the *./files/videos* directory. 
 4. **Update "videoIDs" variables in index.js file**: Open *index.js* file. Find **videoIDs** variable inside a function named *getRandomVideo* (near line 45). Update the variable with respect to the your video IDs. For example, if you have five video files: 1.mp4, 2.mp4, 3.mp4, 4.mp4, 5.mp4, then update the code like this and save: 
```javascript
...
    if (typeof videoList === "undefined") {
        let videoIDs = [1, 2, 3, 4, 5];
        sID_Videos_Map.set(sID, videoIDs);
        videoList  =  sID_Videos_Map.get(sID);
    }
...
```
### Create /data directory
Create a directory called *"data"* at the project directory.

### Run the experiment
Find an **IP address** of the computer where you run the *server script*.
Open a terminal from the project directory and run:
```bash
node index
```
At the computer where the actual event segmentation paradigm would be presented,
Open Google Chrome and connect to **[IP address of the server]:8000**.
For example, if the IP address of your server computer is *127.0.0.1*, the connect
```http
127.0.0.1:8000
```
from the experimental computer.
