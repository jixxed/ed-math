# ED Math Documentation

A documentation website for Elite: Dangerous mathematical formulas and calculations, built with Jekyll and hosted on GitHub Pages.

## Features

- 📝 Markdown-based content
- 🔍 Built-in search functionality
- 📱 Responsive design
- 📊 MathJax support for mathematical notation
- 🎨 Clean, modern UI

## Getting Started

### Prerequisites

- Ruby (version 2.5.0 or higher)
- RubyGems
- GCC and Make

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ed-math.git
   cd ed-math
   ```

2. Install dependencies:
   ```bash
   bundle install
   ```

3. Start the Jekyll server:
   ```bash
   bundle exec jekyll serve
   ```

4. Open your browser to `http://localhost:4000/ed-math/`

## Adding New Content

1. Create a new folder in the `pages` directory with a descriptive name (e.g., `combat-calculations`)
3. Create an `index.md` file with your content
4. Submit a pull request

### Example Structure

```
pages/
  combat-calculations/
    index.md
  mining-yields/
    index.md
```

## Math Support

This site supports LaTeX math notation using MathJax:

- Inline math: `$E = mc^2$`
- Display math: `$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$`

## Deployment

This site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
