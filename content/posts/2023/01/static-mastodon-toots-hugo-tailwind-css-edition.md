---
title: "Static Mastodon toots in Hugo: the Tailwind CSS edition"
description: "Mastodon is becoming more popular, and Tailwind CSS already is immensely popular, so let’s make them work together in your SSG-based website."
author: Bryce Wray
date: 2023-01-16T16:08:00-06:00
# draft: true
# initTextEditor: iA Writer # default --- change if needed
---

[Mastodon](https://joinmastodon.org) use has grown dramatically in recent months, due in large part to the ongoing \[bleep]-show at Twitter following its purchase by Elon Musk. This started shortly after Musk's action was announced back in April, 2022. Not long thereafter, I wrote about how to perform fully static embeds of Mastodon content within a website that's built by the [Hugo](https://gohugo.io) [static site generator](https://jamstack.org/generators). In that post, I based the styling of such embeds on CSS generated by [Sass](https://sass-lang.com). However, I know many prefer to style their sites with the wildly popular [Tailwind CSS](https://tailwindcss.com); so, in this post, I'm going to provide a Tailwind-friendly version of the code from that earlier effort.

<!--more-->

I will spare you a repetition of the info from the [earlier post](/posts/2022/06/static-mastodon-toots-hugo/) about these embeds, so please consult that post as necessary before proceeding.

Other than normal Tailwind itself, the code I present below --- which **as of Tailwind 3.x** produces static embeds with pretty much the same appearance as did the code in the original post --- needs two additional bits of CSS help . . .

**First**, in your Tailwind configuration, you should install the [`tailwind-fluid-typography` plugin](https://github.com/craigrileyuk/tailwind-fluid-typography). It adds a number of `fluid-` classes, each of which makes use of CSS's [`clamp` function](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp) to provide more responsive text sizing. The code makes use of several of these classes.

**Second**, because of a bit of the CSS that Mastodon content includes, you'll need to compensate with a [`@layer` addition](https://tailwindcss.com/docs/adding-custom-styles#using-css-and-layer) after bringing in[^myImport] Tailwind's own regular styling:

[^myImport]: If you're using `@import` to bring in other CSS files in addition to the Tailwind styling, [that'll be necessary for the Tailwind stuff as well](https://tailwindcss.com/docs/using-with-preprocessors#build-time-imports). You may want to refer to ["The code" in my 2022 article](/posts/2022/03/making-tailwind-jit-work-hugo-version-3-edition/#the-code) about using Tailwind CSS 3.x with Hugo.

```css
/*
This is your project's main CSS file,
perhaps `assets/css/index.css` or
`themes/tailwind/assets/css/index.css`.
*/

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
	.toot-content {
		@apply text-gray-900 dark:text-gray-100;
		& .invisible{
			@apply text-[0pt] leading-[0] block w-0 h-0;
		}
		& .ellipsis::after {
			content: "...";
		}
	}
}
```

With all of that understood, here's the Hugo [shortcode](https://gohugo.io/content-management/shortcodes/):

{{< labeled-highlight lang="go-html-template" filename="stoot.html" >}}
{{ $masIns := .Get 0 }}
{{ $tootLink := "" }}
{{ $handleInst := "" }}
{{ $mediaMD5 := "" }}
{{ $imageCount := 0 }}
{{ $votesCount := 0 }}
{{ $id := .Get 1 }}
{{ $urlToGet := print "https://" $masIns "/api/v1/statuses/" $id }}

{{- with resources.GetRemote $urlToGet  -}}
	{{ if (resources.GetRemote $urlToGet).Err }}
		<blockquote class="fluid-base mx-auto my-auto p-4 border-2 border-gray-700 dark:border-gray-200 rounded-xl bg-white dark:bg-gray-600 w-full md:w-[80%]">
			<p class="text-center text-fn">[Source not online<br />
			at time of site build.]</p>
		</blockquote>
	{{ else }}
		{{ $json := unmarshal .Content }}
		{{ $jsonHolder := $json }}{{/* Being safe */}}

		{{ if isset $json "account" }}
			{{ $tootLink = print "https://" $masIns "@" $json.account.acct "/status/" $id }}
			{{ $handleInst = print "@" $json.account.acct "@" $masIns }}
		{{ end }}

		{{ if isset $json "content" }}
			<blockquote class="fluid-base mx-auto my-auto p-4 border-2 border-gray-700 dark:border-gray-200 rounded-xl bg-white dark:bg-gray-900 w-full md:w-[80%]" cite="{{ $tootLink }}">
				<div class="flex">
					<a class="mr-2 flex-shrink-0 no-underline" href="https://{{ $masIns }}/@{{ $json.account.acct }}" rel="noopener">
						<img
							class="w-[48px] h-auto rounded-full"
							src="{{ $json.account.avatar }}"
							alt="Mastodon avatar for {{ $handleInst }}"
							loading="lazy"
						/>
					</a>
					<div class="flex flex-col flex-grow">
						<a class="font-bold text-black dark:text-white fluid-sm lg:fluid-base !tracking-normal no-underline" href="https://{{ $masIns }}/@{{ $json.account.acct }}" rel="noopener">{{ $json.account.display_name }}</a>
						<a class="text-gray-700 dark:text-gray-200 fluid-xs lg:fluid-sm !leading-none !tracking-normal no-underline" href="https://{{ $masIns }}/@{{ $json.account.acct }}" rel="noopener">{{ $handleInst }}</a>
					</div>
				</div>
				<div class="toot-content">{{ $json.content | safeHTML }}</div>
				{{ with $json.media_attachments }}
					{{ range $media_attachments := . }}
						{{ if eq $media_attachments.type "image" }}
							{{ $imageCount = (add ($imageCount) 1) }}
						{{ end }}
					{{ end }}
					<div class="mt-2 rounded-xl overflow-hidden grid grid-cols-1 gap-[2px]">
					{{ range $media_attachments := . }}
						{{ if eq $media_attachments.type "image" }}
							{{ $mediaMD5 = md5 $media_attachments.url }}
							<style>
								.img-{{ $mediaMD5 }} {
									aspect-ratio: {{ $media_attachments.meta.original.width }} / {{ $media_attachments.meta.original.height }};
								}
							</style>
							<img
								src="{{ $media_attachments.url }}"
								alt="Image {{ $media_attachments.id }} from toot {{ $id }} on {{ $masIns }}"
								class="img-{{ $mediaMD5 }}{{ if $json.sensitive }}
								blur-2xl relative{{ end }}"
								loading="lazy"
								{{- if $json.sensitive }}onclick="this.classList.toggle('!blur-none !z-[9999] relative')"{{- end }}
							/>
							{{- if $json.sensitive -}}
								<div class="absolute font-bold w-full top-[40%] text-white text-center text-2xl leading-tight">
									Sensitive content<br />
									(flagged&nbsp;at&nbsp;origin)
								</div>
							{{- end -}}
						{{ end }}
					{{ end }}
					</div>
					{{/*
						N.B.:
						The above results in an empty, no-height div
						when there's no image but there **is**
						at least one item in `$media_attachments`.
						Unfortunately, it seems to be the only way
						to accomplish this. Not a good HTML practice,
						but gets the job done.
					*/}}
					{{ range $media_attachments := . }}
						{{ if eq $media_attachments.type "video" }}
							{{ $mediaMD5 = md5 $media_attachments.url }}
							<style>
								.img-{{ $mediaMD5 }} {
									aspect-ratio: {{ $media_attachments.meta.original.width }} / {{ $media_attachments.meta.original.height }};
								}
							</style>
							<div class="text-center mt-2 rounded-xl overflow-hidden grid grid-cols-1 gap-[2px]">
								<video muted playsinline controls class="text-center w-full h-auto aspect-square object-cover img-{{ $mediaMD5 }}{{ if $json.sensitive }} blur-2xl relative{{ end }}"{{- if $json.sensitive }}onclick="this.classList.toggle('!blur-none !z-[9999] relative')"{{- end }}>
									<source src="{{ $media_attachments.url }}">
									<p class="fluid-xs text-center">(Your browser doesn&rsquo;t support the <code>video</code> tag.)</p>
								</video>
								{{- if $json.sensitive -}}
									<div class="absolute font-bold w-full top-[40%] text-white text-center text-2xl leading-tight">
										Sensitive content<br />
										(flagged&nbsp;at&nbsp;origin)
									</div>
								{{- end -}}
							</div>
						{{ end }}
						{{ if eq $media_attachments.type "gifv" }}
							{{ $mediaMD5 = md5 $media_attachments.url }}
							<style>
								.img-{{ $mediaMD5 }} {
									aspect-ratio: {{ $media_attachments.meta.original.width }} / {{ $media_attachments.meta.original.height }};
								}
							</style>
							<div class="text-center mt-2 rounded-xl overflow-hidden grid grid-cols-1 gap-[2px]">
								<video loop autoplay muted playsinline controls controlslist="nofullscreen" class="text-center w-full h-auto aspect-square object-cover img-{{ $mediaMD5 }}{{ if $json.sensitive }} blur-2xl relative{{ end }}"{{- if $json.sensitive }}onclick="this.classList.toggle('!blur-none !z-[9999] relative')"{{- end }}>
									<source src="{{ $media_attachments.url }}">
									<p class="fluid-xs text-center">(Your browser doesn&rsquo;t support the <code>video</code> tag.)</p>
								</video>
								{{- if $json.sensitive -}}
									<div class="absolute font-bold w-full top-[40%] text-white text-center text-2xl leading-tight">
										Sensitive content<br />
										(flagged&nbsp;at&nbsp;origin)
									</div>
								{{- end -}}
							</div>
						{{ end }}
					{{ end }}
				{{ end }}
				{{ with $json.card }}
					{{- $cardData := . -}}
					{{- with $cardData.image -}}
						<a href="{{ $cardData.url }}" rel="'noopener" class="no-underline decoration-transparent text-gray-700 dark:text-gray-300">
							<div class="relative md:flex border border-gray-700 dark:border-gray-200 rounded-md mt-4 decoration-transparent overflow-hidden">
								<div class="flex-100 md:flex-200 relative">
									<img src="{{ $cardData.image }}" alt="Card image from {{ $masIns }} toot {{ $id }}" loading="lazy" class="block m-0 w-full h-full object-cover bg-cover bg-[50%]" />
								</div>
								<div class="flex-auto overflow-hidden p-3 leading-normal">
									<p class="font-bold fluid-sm !tracking-normal !leading-normal">{{ $cardData.title }}</p>
									<p class="fluid-xs !leading-normal !tracking-normal">{{ $cardData.description }}</p>
								</div>
							</div>
						</a>
					{{- end -}}
				{{ end }}
				{{ with $json.poll }}
					{{ $poll := . }}
					{{ with $poll.options }}
						{{ range $pollOptions := . }}
							{{ $votesCount = add $votesCount $pollOptions.votes_count }}
						{{ end }}
						<div class="grid grid-cols-[3.5em 0.5fr 1fr] gap-[1em]leading-none">
							{{ range $pollOptions := . }}
								<div class="col-start-1 text-right">
									<strong>{{ (mul 100 (div $pollOptions.votes_count $votesCount)) | lang.FormatPercent 1 }}</strong>
								</div>
								<div class="col-start-2">
									<meter class="w-full" id="vote-count" max="{{ $votesCount }}" value="{{ $pollOptions.votes_count }}"></meter>
								</div>
								<div class="col-start-3">{{ $pollOptions.title }}</div>
							{{ end }}
						</div>
						<p class="fluid-xs pt-4">{{ $votesCount }} votes</p>
					{{ end }}
				{{ end }}
				<div class="mt-4 flex items-center text-gray-500 dark:text-gray-300 fluid-sm !tracking-normal">
					<a class="text-gray-600 dark:text-gray-300 no-underline" href="https://{{ $masIns }}/@{{ $json.account.acct }}/{{ $json.id }}" rel="noopener">{{ dateFormat "3:04 PM • January 2, 2006" $json.created_at }}</a>&nbsp;<span class="fluid-xs">(UTC)</span>
				</div>
			</blockquote>
		{{ end }}
	{{ end }}
{{- end -}}
{{</ labeled-highlight >}}