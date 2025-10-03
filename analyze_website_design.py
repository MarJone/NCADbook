#!/usr/bin/env python3
"""
Website Design Style Analyzer
Scrapes a website and extracts comprehensive design style information
"""

import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from collections import Counter, defaultdict
import cssutils
import logging
from typing import Dict, List, Set, Tuple
import json

# Suppress cssutils warnings
cssutils.log.setLevel(logging.CRITICAL)


class DesignStyleAnalyzer:
    def __init__(self, url: str):
        self.url = url
        self.domain = urlparse(url).netloc
        self.html = None
        self.soup = None
        self.css_rules = []
        self.style_guide = {
            'typography': {
                'font_families': Counter(),
                'font_sizes': Counter(),
                'font_weights': Counter(),
                'line_heights': Counter(),
                'letter_spacing': Counter(),
                'heading_styles': {},
                'body_styles': {}
            },
            'colors': {
                'all_colors': Counter(),
                'background_colors': Counter(),
                'text_colors': Counter(),
                'border_colors': Counter()
            },
            'layout': {
                'display_types': Counter(),
                'grid_usage': [],
                'flexbox_usage': [],
                'spacing': {
                    'margins': Counter(),
                    'paddings': Counter()
                },
                'border_radius': Counter(),
                'max_widths': Counter()
            },
            'visual_effects': {
                'box_shadows': Counter(),
                'text_shadows': Counter(),
                'transitions': Counter(),
                'transforms': Counter()
            },
            'ui_patterns': {
                'button_styles': [],
                'card_styles': [],
                'navigation_styles': []
            }
        }

    def fetch_html(self):
        """Fetch the HTML content of the target URL"""
        print(f"Fetching HTML from {self.url}...")
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(self.url, headers=headers, timeout=10)
            response.raise_for_status()
            self.html = response.text
            self.soup = BeautifulSoup(self.html, 'html.parser')
            print("HTML fetched successfully")
            return True
        except Exception as e:
            print(f"Error fetching HTML: {e}")
            return False

    def extract_css_files(self):
        """Extract and fetch external CSS files"""
        print("\nExtracting CSS files...")
        css_contents = []

        # Find all link tags with rel="stylesheet"
        link_tags = self.soup.find_all('link', rel='stylesheet')

        for link in link_tags:
            href = link.get('href')
            if not href:
                continue

            # Convert relative URLs to absolute
            css_url = urljoin(self.url, href)

            try:
                print(f"   Fetching: {css_url}")
                response = requests.get(css_url, timeout=10)
                response.raise_for_status()
                css_contents.append(response.text)
                print(f"   Fetched ({len(response.text)} chars)")
            except Exception as e:
                print(f"    Could not fetch {css_url}: {e}")

        # Extract inline styles
        style_tags = self.soup.find_all('style')
        for style in style_tags:
            if style.string:
                css_contents.append(style.string)

        print(f" Extracted {len(css_contents)} CSS sources")
        return css_contents

    def parse_css(self, css_contents: List[str]):
        """Parse CSS and extract style rules"""
        print("\n Parsing CSS rules...")

        for css_text in css_contents:
            try:
                sheet = cssutils.parseString(css_text)
                for rule in sheet:
                    if rule.type == rule.STYLE_RULE:
                        self.css_rules.append({
                            'selector': rule.selectorText,
                            'styles': {prop.name: prop.value for prop in rule.style}
                        })
            except Exception as e:
                print(f"    Error parsing CSS: {e}")

        print(f" Parsed {len(self.css_rules)} CSS rules")

    def extract_colors(self, value: str) -> List[str]:
        """Extract color values from CSS property values"""
        colors = []

        # Hex colors
        hex_pattern = r'#[0-9a-fA-F]{3,8}'
        colors.extend(re.findall(hex_pattern, value))

        # RGB/RGBA
        rgb_pattern = r'rgba?\([^)]+\)'
        colors.extend(re.findall(rgb_pattern, value))

        # HSL/HSLA
        hsl_pattern = r'hsla?\([^)]+\)'
        colors.extend(re.findall(hsl_pattern, value))

        # Named colors (common ones)
        named_colors = ['white', 'black', 'red', 'blue', 'green', 'yellow', 'gray', 'grey']
        for color in named_colors:
            if color in value.lower():
                colors.append(color)

        return colors

    def normalize_color(self, color: str) -> str:
        """Normalize color format for better grouping"""
        color = color.lower().strip()

        # Convert 3-digit hex to 6-digit
        if re.match(r'^#[0-9a-f]{3}$', color):
            color = '#' + ''.join([c*2 for c in color[1:]])

        return color

    def analyze_typography(self):
        """Analyze typography styles"""
        print("\n Analyzing typography...")

        heading_selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '.heading', '.title']
        body_selectors = ['body', 'p', '.text', '.content', 'main']

        for rule in self.css_rules:
            selector = rule['selector'].lower()
            styles = rule['styles']

            # Font families
            if 'font-family' in styles:
                font_family = styles['font-family'].replace('"', '').replace("'", '')
                self.style_guide['typography']['font_families'][font_family] += 1

                # Categorize by context
                if any(h in selector for h in heading_selectors):
                    self.style_guide['typography']['heading_styles'][selector] = styles
                elif any(b in selector for b in body_selectors):
                    self.style_guide['typography']['body_styles'][selector] = styles

            # Font sizes
            if 'font-size' in styles:
                self.style_guide['typography']['font_sizes'][styles['font-size']] += 1

            # Font weights
            if 'font-weight' in styles:
                self.style_guide['typography']['font_weights'][styles['font-weight']] += 1

            # Line heights
            if 'line-height' in styles:
                self.style_guide['typography']['line_heights'][styles['line-height']] += 1

            # Letter spacing
            if 'letter-spacing' in styles:
                self.style_guide['typography']['letter_spacing'][styles['letter-spacing']] += 1

        print(f"   Found {len(self.style_guide['typography']['font_families'])} font families")

    def analyze_colors(self):
        """Analyze color usage"""
        print("\n Analyzing colors...")

        for rule in self.css_rules:
            styles = rule['styles']

            # Background colors
            if 'background-color' in styles:
                colors = self.extract_colors(styles['background-color'])
                for color in colors:
                    normalized = self.normalize_color(color)
                    self.style_guide['colors']['background_colors'][normalized] += 1
                    self.style_guide['colors']['all_colors'][normalized] += 1

            # Background (might contain colors)
            if 'background' in styles:
                colors = self.extract_colors(styles['background'])
                for color in colors:
                    normalized = self.normalize_color(color)
                    self.style_guide['colors']['background_colors'][normalized] += 1
                    self.style_guide['colors']['all_colors'][normalized] += 1

            # Text colors
            if 'color' in styles:
                colors = self.extract_colors(styles['color'])
                for color in colors:
                    normalized = self.normalize_color(color)
                    self.style_guide['colors']['text_colors'][normalized] += 1
                    self.style_guide['colors']['all_colors'][normalized] += 1

            # Border colors
            for prop in ['border-color', 'border', 'border-top', 'border-right', 'border-bottom', 'border-left']:
                if prop in styles:
                    colors = self.extract_colors(styles[prop])
                    for color in colors:
                        normalized = self.normalize_color(color)
                        self.style_guide['colors']['border_colors'][normalized] += 1
                        self.style_guide['colors']['all_colors'][normalized] += 1

        print(f"   Found {len(self.style_guide['colors']['all_colors'])} unique colors")

    def analyze_layout(self):
        """Analyze layout properties"""
        print("\n Analyzing layout...")

        for rule in self.css_rules:
            styles = rule['styles']

            # Display types
            if 'display' in styles:
                display = styles['display']
                self.style_guide['layout']['display_types'][display] += 1

                if 'grid' in display:
                    self.style_guide['layout']['grid_usage'].append({
                        'selector': rule['selector'],
                        'styles': styles
                    })
                elif 'flex' in display:
                    self.style_guide['layout']['flexbox_usage'].append({
                        'selector': rule['selector'],
                        'styles': styles
                    })

            # Margins
            for prop in ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left']:
                if prop in styles:
                    self.style_guide['layout']['spacing']['margins'][styles[prop]] += 1

            # Paddings
            for prop in ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left']:
                if prop in styles:
                    self.style_guide['layout']['spacing']['paddings'][styles[prop]] += 1

            # Border radius
            if 'border-radius' in styles:
                self.style_guide['layout']['border_radius'][styles['border-radius']] += 1

            # Max widths (container patterns)
            if 'max-width' in styles:
                self.style_guide['layout']['max_widths'][styles['max-width']] += 1

        print(f"   Found {len(self.style_guide['layout']['grid_usage'])} grid usages")
        print(f"   Found {len(self.style_guide['layout']['flexbox_usage'])} flexbox usages")

    def analyze_visual_effects(self):
        """Analyze visual effects like shadows and transitions"""
        print("\n Analyzing visual effects...")

        for rule in self.css_rules:
            styles = rule['styles']

            # Box shadows
            if 'box-shadow' in styles:
                self.style_guide['visual_effects']['box_shadows'][styles['box-shadow']] += 1

            # Text shadows
            if 'text-shadow' in styles:
                self.style_guide['visual_effects']['text_shadows'][styles['text-shadow']] += 1

            # Transitions
            if 'transition' in styles:
                self.style_guide['visual_effects']['transitions'][styles['transition']] += 1

            # Transforms
            if 'transform' in styles:
                self.style_guide['visual_effects']['transforms'][styles['transform']] += 1

        print(f"   Found {len(self.style_guide['visual_effects']['box_shadows'])} shadow styles")

    def analyze_ui_patterns(self):
        """Analyze common UI patterns"""
        print("\n Analyzing UI patterns...")

        button_selectors = ['button', '.btn', '.button', '[type="submit"]', 'a.button']
        card_selectors = ['.card', '.box', '.panel', '.tile']
        nav_selectors = ['nav', '.navigation', '.menu', 'header']

        for rule in self.css_rules:
            selector = rule['selector'].lower()

            if any(btn in selector for btn in button_selectors):
                self.style_guide['ui_patterns']['button_styles'].append({
                    'selector': rule['selector'],
                    'styles': rule['styles']
                })

            if any(card in selector for card in card_selectors):
                self.style_guide['ui_patterns']['card_styles'].append({
                    'selector': rule['selector'],
                    'styles': rule['styles']
                })

            if any(nav in selector for nav in nav_selectors):
                self.style_guide['ui_patterns']['navigation_styles'].append({
                    'selector': rule['selector'],
                    'styles': rule['styles']
                })

        print(f"   Found {len(self.style_guide['ui_patterns']['button_styles'])} button patterns")
        print(f"   Found {len(self.style_guide['ui_patterns']['card_styles'])} card patterns")

    def determine_visual_tone(self) -> str:
        """Determine the overall visual tone of the site"""
        # Analyze characteristics
        has_bold_colors = len([c for c, count in self.style_guide['colors']['all_colors'].most_common(10)
                               if count > 5]) > 3
        has_shadows = len(self.style_guide['visual_effects']['box_shadows']) > 0
        has_rounded = any('px' in br for br in self.style_guide['layout']['border_radius'])
        uses_transitions = len(self.style_guide['visual_effects']['transitions']) > 0

        tones = []
        if has_shadows and has_rounded:
            tones.append("modern")
        if uses_transitions:
            tones.append("dynamic")
        if has_bold_colors:
            tones.append("vibrant")
        else:
            tones.append("minimal")

        return ", ".join(tones) if tones else "clean and professional"

    def generate_markdown_report(self) -> str:
        """Generate a comprehensive Markdown style guide"""
        report = []

        report.append("# Website Design Style Guide")
        report.append(f"\n**Source:** {self.url}")
        report.append(f"\n**Analysis Date:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d')}")
        report.append(f"\n**Visual Tone:** {self.determine_visual_tone()}")

        # Typography Section
        report.append("\n\n##  Typography\n")

        report.append("### Font Families")
        for font, count in self.style_guide['typography']['font_families'].most_common(5):
            report.append(f"- **{font}** (used {count} times)")

        report.append("\n### Font Sizes (Most Common)")
        for size, count in self.style_guide['typography']['font_sizes'].most_common(10):
            report.append(f"- `{size}` (used {count} times)")

        report.append("\n### Font Weights")
        for weight, count in self.style_guide['typography']['font_weights'].most_common(5):
            report.append(f"- **{weight}** (used {count} times)")

        report.append("\n### Line Heights")
        for lh, count in self.style_guide['typography']['line_heights'].most_common(5):
            report.append(f"- `{lh}` (used {count} times)")

        # Colors Section
        report.append("\n\n##  Color Palette\n")

        report.append("### Primary Colors (Most Used)")
        for color, count in self.style_guide['colors']['all_colors'].most_common(10):
            report.append(f"- `{color}` (used {count} times)")

        report.append("\n### Background Colors")
        for color, count in self.style_guide['colors']['background_colors'].most_common(5):
            report.append(f"- `{color}` (used {count} times)")

        report.append("\n### Text Colors")
        for color, count in self.style_guide['colors']['text_colors'].most_common(5):
            report.append(f"- `{color}` (used {count} times)")

        # Layout Section
        report.append("\n\n##  Layout System\n")

        report.append("### Display Types")
        for display, count in self.style_guide['layout']['display_types'].most_common(5):
            report.append(f"- `{display}` (used {count} times)")

        report.append(f"\n### Grid Usage: {len(self.style_guide['layout']['grid_usage'])} instances")
        report.append(f"### Flexbox Usage: {len(self.style_guide['layout']['flexbox_usage'])} instances")

        report.append("\n### Spacing Conventions")
        report.append("\n**Margins (Most Common):**")
        for margin, count in self.style_guide['layout']['spacing']['margins'].most_common(8):
            report.append(f"- `{margin}` (used {count} times)")

        report.append("\n**Paddings (Most Common):**")
        for padding, count in self.style_guide['layout']['spacing']['paddings'].most_common(8):
            report.append(f"- `{padding}` (used {count} times)")

        report.append("\n### Border Radius Styles")
        for br, count in self.style_guide['layout']['border_radius'].most_common(5):
            report.append(f"- `{br}` (used {count} times)")

        report.append("\n### Container Max Widths")
        for mw, count in self.style_guide['layout']['max_widths'].most_common(5):
            report.append(f"- `{mw}` (used {count} times)")

        # Visual Effects Section
        report.append("\n\n##  Visual Effects\n")

        report.append("### Box Shadows (Most Common)")
        for shadow, count in self.style_guide['visual_effects']['box_shadows'].most_common(5):
            report.append(f"- `{shadow}` (used {count} times)")

        if self.style_guide['visual_effects']['text_shadows']:
            report.append("\n### Text Shadows")
            for shadow, count in self.style_guide['visual_effects']['text_shadows'].most_common(3):
                report.append(f"- `{shadow}` (used {count} times)")

        if self.style_guide['visual_effects']['transitions']:
            report.append("\n### Transitions (Most Common)")
            for trans, count in self.style_guide['visual_effects']['transitions'].most_common(5):
                report.append(f"- `{trans}` (used {count} times)")

        # UI Patterns Section
        report.append("\n\n##  UI Component Patterns\n")

        report.append(f"### Button Styles")
        report.append(f"**Found {len(self.style_guide['ui_patterns']['button_styles'])} button style rules**")
        if self.style_guide['ui_patterns']['button_styles']:
            report.append("\n**Example button styles:**")
            for btn in self.style_guide['ui_patterns']['button_styles'][:3]:
                report.append(f"\n`{btn['selector']}`:")
                for prop, value in list(btn['styles'].items())[:5]:
                    report.append(f"  - {prop}: `{value}`")

        report.append(f"\n### Card Styles")
        report.append(f"**Found {len(self.style_guide['ui_patterns']['card_styles'])} card style rules**")

        report.append(f"\n### Navigation Styles")
        report.append(f"**Found {len(self.style_guide['ui_patterns']['navigation_styles'])} navigation style rules**")

        # Design Recommendations
        report.append("\n\n##  Design System Summary\n")

        # Get primary font
        primary_font = self.style_guide['typography']['font_families'].most_common(1)
        primary_font_name = primary_font[0][0] if primary_font else "Not detected"

        # Get primary colors
        primary_colors = [color for color, _ in self.style_guide['colors']['all_colors'].most_common(3)]

        # Layout preference
        layout_pref = "Grid-based" if len(self.style_guide['layout']['grid_usage']) > len(self.style_guide['layout']['flexbox_usage']) else "Flexbox-based"

        report.append(f"**Primary Typography:** {primary_font_name}")
        report.append(f"\n**Key Colors:** {', '.join([f'`{c}`' for c in primary_colors[:3]])}")
        report.append(f"\n**Layout Approach:** {layout_pref} layout system")
        report.append(f"\n**Shadow Usage:** {'Extensive' if len(self.style_guide['visual_effects']['box_shadows']) > 10 else 'Minimal'} use of box shadows")
        report.append(f"\n**Animation Style:** {'Dynamic with transitions' if len(self.style_guide['visual_effects']['transitions']) > 5 else 'Minimal animations'}")

        # Spacing scale
        common_paddings = [p for p, _ in self.style_guide['layout']['spacing']['paddings'].most_common(5)]
        report.append(f"\n**Spacing Scale:** {', '.join([f'`{p}`' for p in common_paddings[:5]])}")

        return "\n".join(report)

    def run_analysis(self):
        """Run the complete analysis pipeline"""
        print("\n" + "="*60)
        print("WEBSITE DESIGN STYLE ANALYZER")
        print("="*60)

        # Step 1: Fetch HTML
        if not self.fetch_html():
            return None

        # Step 2: Extract CSS
        css_contents = self.extract_css_files()
        if not css_contents:
            print("  No CSS found to analyze")
            return None

        # Step 3: Parse CSS
        self.parse_css(css_contents)

        # Step 4: Run analyses
        self.analyze_typography()
        self.analyze_colors()
        self.analyze_layout()
        self.analyze_visual_effects()
        self.analyze_ui_patterns()

        # Step 5: Generate report
        print("\n" + "="*60)
        print(" GENERATING STYLE GUIDE REPORT")
        print("="*60)

        report = self.generate_markdown_report()

        # Save to file
        output_file = "style_guide_analysis.md"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report)

        print(f"\n Analysis complete! Report saved to: {output_file}")
        print("\n" + "="*60 + "\n")

        return report


def main():
    # Target URL
    url = "https://www.ncad.ie/"

    # Create analyzer and run
    analyzer = DesignStyleAnalyzer(url)
    report = analyzer.run_analysis()

    if report:
        print(report)
        print("\n\n Style guide analysis complete!")
        print(f" Full report saved to: style_guide_analysis.md")
    else:
        print(" Analysis failed")


if __name__ == "__main__":
    main()
