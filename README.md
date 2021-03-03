# Audio eXperiment eXplorer

Small web application to explore the outputs of audio generative models made with [`mimikit`](https://github.com/ktonal/mimikit)
and stored in [neptune.ai](https://neptune.ai).

Visit a [live demo](https://ktonal.github.io/axx) containing experiments made by ktonal.

Even though `aXX` is **still in early development!**, it does work and you can build and deploy the app to use it with your
own data. See the next section for detailed instructions.

## Fork and Deploy

You can fork this repository to your own github account and easily deploy a version of `aXX` displaying your data.

To do this :

1. Have a GitHub Account and some `mimikit` models on your neptune.ai account

2. Fork this repo through github's fork button

3. in the forked repo, go to Settings > Secrets > New repository secret and add a Secret whose name is `NEPTUNE_API_TOKEN` and whose value is your neptune token enclosed in `"`, i.e. `"oij234df9u3"`.

4. Go back to the code through the Code tab and open the file `config.json` by clicking on it.

5. in the top right, you should see a pen icon. Click on it for editing that file : change the `"user"` and `"projects"` fields to your neptune username and to the names of the neptune projects you want aXX to display.

6. Now at the bottom of the page, click on "Commit changes".

7. Go to the Actions tab and click on `Build and Deploy`. You should now see a button `Run workflow` at the top of the workflow list. 
Click on it! This will execute a script that downloads your audios, convert them to mp3 and deploy aXX. Depending on how much audios you have, this can take from 3 minutes to a full hour.

8. Go back to the Settings tab and in the Github Pages section, choose `gh-pages` as the source and save. A link to your aXX page should now appear. Enjoy!
