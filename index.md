---
layout: home
---

# Welcome to ED Math Documentation

This is a collection of mathematical documentation for Elite: Dangerous. Browse the pages below or use the search to find specific topics.

## Pages

{% assign sorted_pages = site.pages | sort: 'title' %}
<div class="page-list">
  {% for page in sorted_pages %}
    {% if page.dir contains '/pages/' and page.name == 'index.md' %}
      <div class="page-card">
        <h2><a href="{{ page.url | relative_url }}">{{ page.title }}</a></h2>
        <p>{{ page.description }}</p>
        <a href="{{ page.url | relative_url }}" class="read-more">Read more →</a>
      </div>
    {% endif %}
  {% endfor %}
</div>

## How to Contribute

1. Fork this repository
2. Create a new folder in the `pages` directory
3. Add a `description.md` with a brief description
4. Add your content in a file named `index.md`
5. Submit a pull request
