import Remarkable from 'remarkable';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const markdown = new Remarkable({
    html: true,
    xhtmlOut: false,
    breaks: true,
    linkify: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (err) {
                // Ignore
            }
        }

        try {
            return hljs.highlightAuto(str).value;
        } catch (err) {
            // Ignore
        }

        return ``; // use external default escaping
    },
});

export default markdown;
