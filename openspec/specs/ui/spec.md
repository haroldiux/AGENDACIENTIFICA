# UI Specification

## Purpose
To establish a modern, minimal, premium UI/UX aesthetic for the AGENDA CIENTIFICA system using `shadcn/ui`, `geist` fonts, and `next-themes`, while retaining the UNITEPC brand colors (Purple and Cyan).

## ADDED Requirements
### Requirement: Typography and Theming
The system MUST use `geist` fonts for typography and support toggling between Light and Dark modes seamlessly via `next-themes`.
#### Scenario: Toggling application theme
- GIVEN the application is in Light mode
- WHEN the user clicks the theme toggle button
- THEN the application MUST switch to Dark mode and persist this preference

### Requirement: Brand Identity Integration
The system MUST incorporate UNITEPC Purple and Cyan as primary and accent theme tokens within `shadcn/ui` CSS variables.
#### Scenario: Rendering primary components
- GIVEN a `shadcn/ui` Button component with a primary variant
- WHEN the component is rendered on the screen
- THEN the background MUST display the UNITEPC Purple color

### Requirement: Component Architecture
The system MUST utilize `shadcn/ui` components to replace raw HTML elements and custom CSS classes (e.g., `glass-panel`).
#### Scenario: Displaying data views
- GIVEN the user navigates to the Activities view (`/actividades`)
- WHEN the view renders the content
- THEN the items MUST be wrapped in `shadcn/ui` Card components instead of raw HTML

### Requirement: Premium Layout Design
The system MUST implement a sleek, minimal, and collapsible Sidebar matching a premium aesthetic.
#### Scenario: Interacting with the Sidebar
- GIVEN the user is on the main application layout
- WHEN the user toggles the Sidebar
- THEN the Sidebar MUST collapse smoothly using `framer-motion`, maximizing main content space

### Requirement: Calendar Theming Overhaul
The `react-big-calendar` component MUST be heavily restyled with targeted CSS overrides to integrate with the minimal aesthetic.
#### Scenario: Viewing the calendar in Dark mode
- GIVEN the user navigates to the Calendar view in Dark mode
- WHEN the `react-big-calendar` renders
- THEN the structural borders and events MUST display appropriate Dark mode colors and UNITEPC accents

## REMOVED Requirements
### Requirement: Custom CSS Utility Classes
(Reason: The system is deprecating raw CSS classes like `glass-panel` in favor of standard `shadcn/ui` semantic variables and components.)
