// Initialize Mermaid diagrams
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Mermaid
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            themeVariables: {
                // Support for dark mode
                primaryColor: '#4a90e2',
                primaryTextColor: '#333',
                primaryBorderColor: '#4a90e2',
                lineColor: '#333',
                secondaryColor: '#f0f0f0',
                tertiaryColor: '#fff'
            }
        });
        
        // Explicitly render any mermaid code blocks
        document.querySelectorAll('code.language-mermaid').forEach(function(codeBlock) {
            const pre = codeBlock.parentNode;
            if (pre && pre.tagName === 'PRE') {
                const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
                const div = document.createElement('div');
                div.className = 'mermaid';
                div.id = id;
                div.textContent = codeBlock.textContent;
                pre.parentNode.replaceChild(div, pre);
            }
        });
    }

    // Initialize Vega/Vega-Lite diagrams
    // Process pre > code blocks (standard markdown output)
    document.querySelectorAll('pre code.language-vega, pre code.language-vega-lite').forEach(function(codeBlock) {
        const pre = codeBlock.parentNode;
        if (!pre || pre.tagName !== 'PRE') return;
        
        const container = document.createElement('div');
        container.className = 'vega-container';
        
        // Replace the pre element with the container
        pre.parentNode.replaceChild(container, pre);
        
        try {
            const spec = JSON.parse(codeBlock.textContent);
            const isVegaLite = codeBlock.classList.contains('language-vega-lite');
            
            vegaEmbed(container, spec, {
                mode: isVegaLite ? 'vega-lite' : 'vega',
                actions: {
                    export: true,
                    source: true,
                    compiled: true,
                    editor: true
                }
            }).catch(function(error) {
                console.error('Error rendering Vega diagram:', error);
                container.innerHTML = '<p style="color: red;">Error rendering diagram: ' + error.message + '</p>';
            });
        } catch (error) {
            console.error('Error parsing Vega spec:', error);
            container.innerHTML = '<p style="color: red;">Error parsing diagram specification: ' + error.message + '</p>';
        }
    });
});
