# Fresh Vision — PS-II speaking script

Presenter: Vishal Verma  |  Faculty mentor: Dr. Aurobindo Behera  |  11 slides, ~14 min 40 s

Large paragraphs = say this aloud. NOTE blocks = do not read aloud.

## S1 — Title — Fresh Vision   [0:00 → 0:45]

Good morning everyone. My name is Vishal Verma, and today I am going to present my Practice School-II project, Fresh Vision.

Fresh Vision is an AI-powered fruit and vegetable quality analyzer. In simple words — you give it one photo of a fruit or a vegetable, and it tells you two things: what the produce is, and how fresh or rotten it is.

I worked on this under the guidance of my faculty mentor, Dr. Aurobindo Behera Sir, and my industry mentor, [industry mentor name], at [organisation name].

Let me begin with the station and the task I was given.

> NOTE TO SELF:
> Do not rush this. Stand still, look at the panel, and let the two-sentence explanation land — most examiners decide in the first 30 seconds whether they understand your project.

## S2 — PS-II Station & Visit Summary   [0:45 → 1:55]

My PS-II station was [organisation name], and I worked in the [department] department, from [start date] to [end date].

The work area was applied computer vision — basically, using AI to understand images.

My task had three parts. Identify which fruit or vegetable is in a photo. Grade how far the decay has gone — not just fresh or rotten. And deliver it as a working web application, not just a notebook running on my laptop.

On the right you can see how the eight weeks went. The first two weeks were data — building the dataset and the pipeline. Weeks three and four were the identifier model and the labelling problem, which I will explain shortly. Weeks five and six were training and fine-tuning the freshness model. And the last two weeks were the actual product — the backend and the web interface.

Now let me explain why this project was needed in the first place.

> NOTE TO SELF:
> Do not read all eight weeks out loud. Sweep your hand down the column and call out only W4 and W8 — those are the two turning points of the project.

## S3 — Problem Identification   [1:55 → 3:25]

This is the problem I started with. In most shops and warehouses, produce quality is still checked by eye, one item at a time, by a person.

There are three issues with that.

First, it is subjective. Two people looking at the same tomato can give two different answers. And after a long shift, when a person is tired, the accuracy drops.

Second, it does not scale. A warehouse handles thousands of crates. Nobody can check every single item. So spoiled stock reaches the shelf, and good stock gets thrown away.

Third — and this is the technical gap I found — the public datasets available label produce only as fresh or rotten. Just two labels. But "rotten" cannot tell you the difference between "use this today" and "throw this out now".

And there is one more issue, in the green box. A normal image classifier has no idea what "not a fruit" means. Show it a photo of a car, and it will still confidently say "banana". It has no way to say "I don't know".

So the gap was clear. No lightweight system does all three things together — identify the produce, grade the decay properly, and refuse images it should not be judging at all.

> THIS IS YOUR SETUP:
> The "car / banana" line is the most memorable sentence in your whole presentation. Pause for a beat after it. Everything you build later is the answer to this one slide, so do not hurry it.

## S4 — Problem Statement & Objectives   [3:25 → 4:40]

So here is my problem statement.

From a single photograph, the system should identify the fruit or vegetable, grade its freshness on a five-level scale, and reject any image that is not produce — while showing every confidence value instead of hiding it.

That last part mattered to me. I did not want a black box. If the model is only sixty percent sure, the user should be able to see that.

From this statement I set five objectives.

One, identify the produce reliably, using transfer learning on MobileNetV2.

Two — and this was the hardest part — create the five freshness labels that did not exist in the dataset.

Three, train the freshness model and then correct its output, because it came out biased.

Four, make the system refuse what it cannot judge.

And five, deploy it as a real application, with a backend and a web interface.

Let me now show you how the whole thing works.

> NOTE TO SELF:
> Read only the bold titles of the five objectives — the panel can read the descriptions themselves. Slow down on objective two and say "this was the hardest part", because that is what you want them to ask about.

## S5 — Methodology — End-to-End Workflow   [4:40 → 6:30]

This diagram has two halves.

The top half is the offline part — the training work, which I did once, before the app existed. I start with the unified dataset: fourteen types of produce, each with a fresh folder and a rotten folder. Then HSV decay scoring turns those two labels into five. Then transfer learning trains the models. The output of this whole top lane is the two model files you see on the right.

The bottom half is the online part — what happens every single time someone uploads a photo.

The photo comes in, maximum ten megabytes, and it is kept in memory only. Then it is resized to two-twenty-four by two-twenty-four and normalised. This step is important — the image has to be prepared in exactly the same way the model saw images during training, otherwise the prediction will be wrong.

Then the gatekeeper asks one question: is this even produce? If the answer is no, we stop right here — that is this orange arrow going down.

If it passes, the identifier names the fruit. But if it is not at least sixty-five percent confident, we stop again and say the image is unclear. That is the second orange arrow.

And only if both checks pass does the freshness model run and grade the decay level.

Please notice these two orange branches. These are the two ways my system says "I don't know" instead of guessing — and I will show one of them actually working in the results.

The blue bar at the bottom is the final output: the fruit name, the freshness level, both confidence values, the full distribution across all five levels, the estimated shelf life, and how long the prediction took.

Now let me show you the architecture behind this.

> USE THE SCREEN:
> This is a diagram slide — physically point at things. Trace the top lane left to right, then the bottom lane, then tap the two orange arrows. Talking through a diagram without pointing at it is the most common way students lose marks on a slide like this.

## S6 — System Architecture   [6:30 → 8:20]

This slide shows how the software is actually built. Read it from top to bottom.

At the top is the client — the part the user sees. It is a single-page web app built with React 19 and Vite. The user drags and drops an image, or even pastes it directly.

That image is sent to the backend as a POST request to the predict endpoint.

The middle layer is the API, built with FastAPI and Uvicorn in Python. Here, Pillow and NumPy convert the image into the tensor that the model needs.

Below that, in green, is the model layer, where all three models live. On the left is the gatekeeper — this is a ready-made MobileNetV2 trained on ImageNet, which already knows a thousand everyday objects. I did not train this one; I use it as a filter. In the middle is my produce identifier — fourteen classes, about 2.4 million parameters. And on the right is my freshness classifier — five levels, also about 2.4 million parameters.

One design decision I want to highlight here. These models are loaded once when the server starts, not every time a request comes in. Loading a model takes a few seconds. If I loaded them per request, every single user would wait that long. Because they are loaded at startup, an actual prediction takes only about three hundred milliseconds.

Everything comes back as one JSON object — that is the dark box.

And one last point at the bottom. There is no database in this project, and nothing is written to disk. Also, the same Python server can serve the website itself, so the entire application runs on a single port. That makes it very easy to deploy.

Now let me go into the three most important technical decisions I made.

> NOTE TO SELF:
> The "loaded once at startup" point is a genuine engineering decision, not a fact from a tutorial. Examiners like this kind of thing — say it with a bit of confidence.

## S7 — Key Implementation   [8:20 → 10:45]

There are three things on this slide, and these are the parts I would like to explain properly.

The first is transfer learning. This simply means that instead of training a neural network from zero, I take a model that is already trained on millions of images and reuse what it has already learned. It already knows edges, shapes, colours and textures — I only teach it my specific task.

I chose MobileNetV2 because it is small and fast. It was designed for mobile phones, so it runs on a normal CPU without a graphics card.

I trained in two phases. In phase one, I froze the whole MobileNetV2 backbone — meaning its weights do not change — and trained only my own small classification head on top. In phase two, I unfroze the last thirty layers and trained again with a very small learning rate, 0.00001. The small learning rate matters here — a large one would have destroyed the good weights the model already had.

The second point is the one I am most proud of — pseudo-labelling.

The problem was that my dataset had only two labels, but I needed five. Labelling thousands of images by hand was not realistic. So I solved it using classical computer vision, with no deep learning at all.

I converted each image from RGB to HSV — that is Hue, Saturation and Value — because HSV separates the colour from the brightness, so it stays stable when the lighting changes. I then used the saturation channel to separate the fruit from the background. Then, inside the fruit only, I detected the brown, decayed pixels. And finally I calculated a decay score: the number of decayed pixels divided by the total fruit pixels, times a hundred.

Then I sorted those scores and split them into five buckets — separately for each fruit type. Separately is important, because a rotten banana and a rotten apple are not the same colour. One common threshold for everything would have been wrong.

The third point is calibration. After training, I noticed the freshness model kept predicting "slightly rotten" far too often, and almost never predicted "very rotten". So at prediction time I multiply those classes by fixed numbers — 0.3, 1.5 and 2.5 — and then normalise everything again so the probabilities still add up to one.

I will be honest — this is a practical fix, not a perfect one. The proper solution would be to retrain the model with balanced data.

Now let me show you the results.

> YOUR STRONGEST TWO MINUTES:
> Pseudo-labelling is the part of this project that a normal student project does not have. Slow right down for it. If you only get one thing across in the whole presentation, make it this.
> Saying "I will be honest, this is a practical fix" sounds like weakness but reads as maturity. Keep it — it usually prevents the examiner from attacking that point.

## S8 — Results & Discussion   [10:45 → 12:50]

On the left is the accuracy of my freshness classifier. In phase one, with the backbone frozen, I got 77.8 percent validation accuracy. After fine-tuning the last thirty layers in phase two, it went up to 80.4 percent. That is a gain of 2.6 points, which tells me the fine-tuning step was worth doing.

On the right is a real run against the live system. This is not a mock-up — it is an actual screenshot from the running application. I uploaded an image that is not produce, and you can see the system caught it. It says "Not a Fruit or Vegetable", it tells you what ImageNet actually thought the object was and with what confidence, and it did all of this in 328 milliseconds.

I am showing this deliberately, because this is the guardrail working. Most systems would have confidently called this a fruit. Mine refused. The second guardrail behaves the same way — anything below sixty-five percent comes back as "Unclear Image", along with its top three closest matches, so the user can still see what the model was thinking.

The tiles below are the numbers I would defend: 80.4 percent validation accuracy, fourteen produce classes across five freshness levels, three models in the pipeline, about 310 milliseconds per image on a CPU, and 35 megabytes of models in total.

And I should be honest about one limitation. My five freshness labels are pseudo-labels that I generated myself, not labels checked by a human. So 80.4 percent is accuracy against those generated labels. That is the main weakness of the project, and collecting properly labelled data is the first thing I would do next.

> SAY THIS BEFORE THEY ASK:
> Two lines here are doing defensive work. "This is not a mock-up" stops the examiner wondering whether you actually ran anything. And volunteering the pseudo-label limitation yourself takes away the strongest attack they have.
> If you demo the live app, do not present the "Apple · 98.4% · Very Fresh" card on the landing page as a result — that card is a fixed design mock-up in the frontend code, not a real prediction. Scroll past it to the analyzer.

## S9 — Conclusion & Key Achievements   [12:50 → 13:35]

To conclude. I delivered a complete working system, from the dataset all the way to a deployed user interface — not just a notebook.

The achievement I would point to is solving the missing-label problem with classical computer vision instead of manual annotation. And the fact that the system refuses to answer when it should not, instead of guessing quietly.

And practically — at 35 megabytes, running on a CPU, in about three hundred milliseconds, it is small enough to actually run where produce is handled, and not only in a lab.

> NOTE TO SELF:
> Slow down and drop your pace here. This is a summary, not new information — the panel should feel you landing the plane.

## S10 — Learning Outcomes   [13:35 → 14:15]

Six things I take away from this project.

Transfer learning in practice — when to freeze layers and when to fine-tune them. Reading a CNN architecture well enough to choose the right model for where it will actually run. Data-centric problem solving — when the labels you need do not exist, engineer them. Debugging a model by looking at its output distribution. Full-stack deployment — turning a trained model into a real service. And finally, engineering judgement: being able to say honestly what my system cannot do.

> NOTE TO SELF:
> Read this as one flowing list, not six separate points. It should take about forty seconds — any longer and you are eating into question time.

## S11 — References   [14:15 → 14:40]

These are my references — the MobileNetV2 and ImageNet papers, the Keras and TensorFlow documentation I worked from, and the frameworks I used. The complete code, the models and the training scripts are all in the repository listed at the bottom.

Thank you for listening. I am happy to answer any questions you may have.

> NOTE TO SELF:
> Never read a reference list aloud. One sentence, then close. End on eye contact, not on the screen.


## Likely examiner questions

**Q. Why did you use three models instead of one?**

Because the two tasks are genuinely different. Identifying a fruit and judging how rotten it is need different training data and different labels, so a single model would have had to compromise on both. Keeping them separate means each one does its own job well.

The third model, the gatekeeper, is there for robustness. Without it, the system has no way to reject an input that is not produce at all.

**Q. What is transfer learning, and why did you use it?**

Transfer learning means reusing a model that has already been trained on a very large dataset — in my case MobileNetV2 trained on ImageNet — instead of training from scratch. The early layers have already learned general things like edges, colours and textures, which are useful for almost any image task.

I used it because my dataset was small. Training a CNN from zero on a small dataset would overfit badly and would take far longer.

**Q. What exactly is pseudo-labelling, and isn't it unreliable?**

Pseudo-labelling means generating labels automatically when real ones are not available. My dataset had only fresh and rotten, but I needed five levels, so I used HSV colour thresholding to measure how much of each fruit looked decayed, and turned that score into five buckets.

(Say this part too) You are right that it is not as reliable as human labelling — the labels are only as good as my colour heuristic. That is why I describe 80.4 percent as accuracy against those generated labels, not against ground truth. Replacing them with properly annotated data is the first improvement I would make.

**Q. Why MobileNetV2 and not ResNet or VGG?**

Because of where it has to run. MobileNetV2 has around 2.4 million parameters and my saved model is under 12 megabytes, so it runs on an ordinary CPU with no graphics card, in about 300 milliseconds. VGG16 has roughly 138 million parameters — far too heavy for a web app meant to run on normal hardware.

I chose the model for the deployment target rather than for the highest possible benchmark score.

**Q. Why did you convert to HSV instead of working in RGB?**

In RGB, the colour and the brightness are mixed together across all three channels, so if the lighting changes, all three values change. HSV keeps the colour information in the hue and saturation channels and the brightness separately in the value channel.

Since I was detecting brown decayed patches by colour, HSV made the thresholding much more stable across differently lit photos.

**Q. How did you choose the calibration multipliers 0.3, 1.5 and 2.5?**

(Confirm this matches what you did) They were tuned by hand. I looked at the predictions the model was producing, saw that "slightly rotten" was dominating and "very rotten" almost never appeared, and adjusted the multipliers until the output distribution looked sensible on my test images.

It is an empirical correction, not something derived from theory. The correct long-term fix is to retrain with balanced classes or class weights, but calibration solved the visible problem quickly.

**Q. What does 80.4 percent accuracy actually mean here?**

It is the validation accuracy of the freshness classifier — the percentage of images in the held-out twenty percent of the data where the predicted freshness level matched the label. The data was split eighty–twenty in a stratified way, so each class kept the same proportion in both sets.

Importantly, those labels are my generated pseudo-labels, so it measures agreement with my labelling method rather than with a human expert.

**Q. How did you prevent overfitting?**

Three ways. I kept most of the pretrained backbone frozen, so there were far fewer trainable parameters. I added a dropout layer of 0.3 in my classification head, which randomly switches off thirty percent of the neurons during training. And I used a stratified train–validation split so I could actually see the validation accuracy separately from the training accuracy.

**Q. What happens if I upload a photo with two different fruits in it?**

The model is trained on single items, so with a cluttered frame the confidence drops. In most cases it will fall below my sixty-five percent threshold and the system returns "Unclear Image" along with the top three closest matches, rather than picking one at random.

Handling multiple items properly would need object detection to find and crop each item first — that is a clear next step, not something this version does.

**Q. What was your specific contribution to this project?**

(Fill this in honestly before tomorrow) Prepare one clear sentence, for example: "I worked on [your parts], and Harshul worked on [his parts]." Then give one concrete example from your part — the pseudo-labelling pipeline, or the FastAPI backend, or the React interface.

A confident, specific answer here is worth more than trying to claim everything.

## Terms to know

- **CNN** — Convolutional Neural Network — a neural network designed for images, which learns visual patterns like edges and shapes through filters.
- **Transfer learning** — Reusing a model already trained on a large dataset, and retraining only part of it for your own smaller task.
- **Freezing / fine-tuning** — Freezing means locking a layer's weights so training does not change them. Fine-tuning means unlocking some layers later and training them gently with a small learning rate.
- **MobileNetV2** — A lightweight CNN designed for phones and low-power devices. It is efficient because it splits normal convolutions into cheaper depthwise and pointwise steps.
- **Parameters** — The numbers inside the network that get adjusted during training. Both of my models have about 2.4 million.
- **Softmax** — The final layer that turns raw model outputs into probabilities that add up to one, so you can read them as confidence values.
- **Epoch** — One full pass of the training data through the model. I trained five epochs in each phase.
- **Learning rate** — How big a step the model takes when correcting itself. I used 0.00001 in phase two so the pretrained weights were not damaged.
- **Dropout** — Randomly switching off some neurons during training so the model does not memorise the training data. I used 0.3.
- **Overfitting** — When a model learns the training data too specifically and performs badly on new, unseen images.
- **Validation accuracy** — Accuracy measured on data the model never trained on — the honest measure of how well it generalises.
- **Stratified split** — Splitting data so every class keeps the same proportion in the training and validation sets.
- **HSV** — Hue, Saturation, Value — a colour space that separates colour from brightness, which makes colour-based thresholding more reliable under changing light.
- **Pseudo-labelling** — Generating labels automatically by some method when real human labels are not available.
- **Out-of-distribution** — An input that is nothing like the training data — for example a car shown to a fruit classifier. My gatekeeper exists to catch these.
- **Inference & latency** — Inference is running the trained model on a new image. Latency is how long that takes — about 310 milliseconds in my system.
- **API endpoint** — A specific URL on the server that accepts a request and returns a response. Mine is /api/predict.
- **JSON** — A simple text format for sending structured data between the server and the browser.

## Presentation tips

- **[Slide 3]** Pause after the "car / banana" line. It is the single sentence that makes the panel understand why your gatekeeper exists. Let it sit for a second before moving on.
- **[Slide 5]** Point at the diagram, don't describe it. Trace the top lane, then the bottom lane, then tap each orange arrow as you mention it. Standing still and talking at a workflow diagram loses marks.
- **[Slide 7]** This is where the marks are. Give pseudo-labelling more time than anything else. It is the one part of the project that a typical student submission does not have.
- **[Slide 8]** Say "this is a real screenshot" out loud. Otherwise someone will assume the result is illustrative, and you lose the credit for having actually deployed and run the system.
- **[Slide 8]** Volunteer the pseudo-label limitation. Admitting it yourself almost always closes the line of questioning. Waiting to be caught on it does the opposite.
- **[If demoing]** Have the app already running before you walk in. The first prediction after startup takes about three seconds because the models load lazily; every one after that is around 300 ms. Run one throwaway image beforehand so the demo looks fast.
- **[If demoing]** Skip the landing-page card. The "Apple · 98.4% · Very Fresh" panel at the top of the site is a fixed design mock-up, not a live prediction. Scroll straight down to the analyzer section.
- **[Pronounce]** Practise these out loud tonight: MobileNetV2, Uvicorn ("you-vee-corn"), softmax, stratified, out-of-distribution.
- **[Timing]** Two checkpoints. You should be finishing slide 4 at about 4:30, and finishing slide 7 at about 10:45. If you are behind at slide 7, cut the dotted sentences and shorten slide 10.
- **[Numbers]** Know your five numbers cold: 77.8 → 80.4 percent, 14 classes, 5 levels, 3 models, ~310 ms, 35 MB. If you blank on everything else, these carry the results slide.
- **[If stuck]** Have one honest fallback line. "I did not test that specifically, but based on how the pipeline works I would expect…" is a perfectly good answer. Guessing confidently and being wrong is much worse.
