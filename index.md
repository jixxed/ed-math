---
layout: home
---

# Welcome to ED Math Documentation

This is a collection of mathematical documentation for Elite: Dangerous. Browse the pages below or use the search to find specific topics.

<div class="search-container">
  <input type="text" id="searchInput" placeholder="Search pages..." autofocus>
</div>

## Pages

{% assign sorted_pages = site.pages | sort: 'title' %}
<div class="page-list">
  {% for page in sorted_pages %}
    {% if page.dir contains '/pages/' and page.name == 'index.md' %}
      <div class="page-card" data-title="{{ page.title | downcase }}" data-description="{{ page.description | downcase }}">
        <h2><a href="{{ page.url | relative_url }}" class="page-title">{{ page.title }}</a></h2>
        <p class="page-description">{{ page.description }}</p>
        <a href="{{ page.url | relative_url }}" class="read-more">Read more →</a>
      </div>
    {% endif %}
  {% endfor %}
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const pageCards = document.querySelectorAll('.page-card');
  const pageTitles = document.querySelectorAll('.page-title');
  const pageDescriptions = document.querySelectorAll('.page-description');

  // Focus the search input on page load
  searchInput.focus();

  function filterPages() {
    const searchTerm = searchInput.value.toLowerCase();
    
    pageCards.forEach((card, index) => {
      const title = card.getAttribute('data-title');
      const description = card.getAttribute('data-description');
      
      if (title.includes(searchTerm) || description.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Add event listener for search input
  searchInput.addEventListener('input', filterPages);
  
  // Also filter when pressing Enter (useful for mobile keyboards)
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      filterPages();
    }
  });
});
</script>

<style>
.search-container {
  margin: 2rem 0;
  max-width: 600px;
}

#searchInput {
  width: 100%;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

#searchInput:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* Hide page cards by default when JavaScript is enabled */
.page-card {
  transition: opacity 0.2s ease-in-out;
}

.page-card.hidden {
  display: none;
  opacity: 0;
  height: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
</style>

