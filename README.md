This branch exposes `axx` as a command-line for running it locally.
 
 # Requirements
 
 For it to work, it expects that the directory from which it is called contains

- a `axx-data.json` file. This is an array of dictionaries, each of which corresponds to a row in the axx table. Keys are the columns' names, values the row's values.
> each row in `axx-data.json` should contain an `"audios"` field whose value is an array of string : the paths to the audio files for this row relative to the directory the `axx` cli was called from. 

- a `config.json` file with the field `"columns"` and `"groupBy"`, both arrays of strings, which denote respectively the name of the columns that are initially visible and grouped.

- the audio files to be served

# Installation

once you cloned this repo :

```bash
cd axx
git checkout axx-cli
sudo npm install -g http-server
sudo npm install -g .
sudo npm link
```

# Usage

once you have a directory that fulfills the requirements listed above, simply `cd` into it and launch the server with

```bash
axx
``` 

that's it!