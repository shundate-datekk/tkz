# Product Overview - TKZ (AI Tools & Sora Prompt Generator)

## Product Description

TKZ is a collaborative AI tools information sharing and Sora2 prompt generation application designed for two specific users: TKZ and コボちゃん (Kobo-chan). The application serves as a centralized platform for discovering, evaluating, and sharing AI tools while providing automated, high-quality prompt generation for Sora2 video creation.

## Core Features

### 1. AI Tools Management
- **Tool Registration & Cataloging**: Add, edit, and delete AI tools with comprehensive metadata
- **Multi-Category Classification**:
  - テキスト生成 (Text Generation)
  - 画像生成 (Image Generation)
  - 動画生成 (Video Generation)
  - 音声生成 (Audio Generation)
  - コード生成 (Code Generation)
  - その他 (Other)
- **5-Star Rating System**: Evaluate and compare tools with 1-5 star ratings
- **Usage Documentation**: Record purpose, use cases, and personal impressions
- **Creator Attribution**: Track who added each tool for accountability
- **Soft Delete**: Tools are marked as deleted rather than permanently removed
- **Like System**: Express appreciation for useful tools

### 2. Advanced Search & Filtering
- **Real-time Search**: Instant results across tool names, purposes, and impressions
- **Category Filtering**: Quickly narrow down to specific AI tool types
- **Multi-Sort Options**:
  - By usage date (newest/oldest)
  - By rating (highest/lowest)
  - By registration date (newest/oldest)
- **Debounced Search**: Optimized performance with 300ms debounce
- **Result Count Display**: Always know how many tools match your criteria

### 3. Sora2 Prompt Generation (GPT-4 Powered)
- **AI-Assisted Prompt Creation**: Automatic generation of English prompts optimized for Sora2
- **Flexible Input Parameters**:
  - 目的 (Purpose) - Required
  - シーン説明 (Scene Description) - Required
  - スタイル (Style) - Realistic, Anime, Cinematic, Documentary, Experimental, etc.
  - 長さ (Length) - 3s, 5s, 10s, 20s, 30s, 60s
  - その他の要望 (Additional Requests) - Custom requirements
- **Prompt Actions**:
  - One-click copy to clipboard
  - Regenerate with same parameters
  - Save to history
- **Loading State Display**: Visual feedback during generation

### 4. Prompt History Management
- **Automatic Saving**: All generated prompts stored with metadata
- **Card-Based History View**: Easy browsing of past generations
- **Detailed History Pages**: Full context for each prompt
- **Copy from History**: Reuse successful prompts
- **Keyword Search**: Find specific prompts quickly
- **Delete Capability**: Remove unwanted history entries

### 5. Responsive Design
- **Multi-Device Support**: Optimized for PC, tablet, and smartphone
- **Mobile Navigation**: Hamburger menu with bottom navigation bar
- **Touch-Optimized**: Gesture-friendly interactions
- **Responsive Grid Layouts**: Adapts to screen size gracefully

### 6. User Authentication & Access Control
- **NextAuth.js v5**: Secure, modern authentication
- **24-Hour Sessions**: Persistent login with session management
- **Protected Routes**: Automatic redirection for unauthorized access
- **Creator Permissions**: Only tool creators can edit/delete their tools
- **Remember Me**: Optional extended session persistence

## Target Use Cases

### Primary Scenarios
1. **AI Tool Discovery**: TKZ and コボちゃん share and discover new AI tools in their work
2. **Tool Evaluation**: Collaborate on rating and reviewing AI tools for team use
3. **Video Content Creation**: Generate Sora2 prompts for video projects efficiently
4. **Prompt Library Building**: Build a personal library of successful Sora prompts
5. **Workflow Documentation**: Record which tools work best for specific tasks

### User Personas
- **TKZ**: Primary user - requires comprehensive tool management and prompt generation
- **コボちゃん (Kobo-chan)**: Secondary user - collaborates on tool evaluation and sharing

## Key Value Propositions

### For AI Tool Management
✅ **Centralized Knowledge Base**: No more scattered bookmarks or forgotten tools
✅ **Collaborative Rating System**: Make better tool choices based on real experience
✅ **Quick Discovery**: Advanced filtering means finding the right tool takes seconds
✅ **Usage Context**: Remember why you chose a tool and how it performed

### For Sora2 Prompt Generation
✅ **Time Savings**: Generate optimized prompts in seconds instead of trial-and-error
✅ **Quality Assurance**: GPT-4 ensures prompts follow Sora2 best practices
✅ **Consistency**: Structured input parameters lead to reliable outputs
✅ **Historical Reference**: Learn from past successes with searchable history

### Overall Platform Benefits
✅ **Mobile-First UX**: Access and add tools on-the-go from any device
✅ **Fast & Responsive**: Optimized performance with debouncing and code splitting
✅ **Secure**: Row-level security ensures data privacy
✅ **Reliable**: Comprehensive test coverage (220+ tests) ensures stability

## Success Metrics

### User Engagement
- Number of tools registered and actively maintained
- Frequency of tool searches and filtering usage
- Prompt generation sessions per week
- History lookup and reuse rate

### Quality Indicators
- Average tool ratings (target: 3.5+ stars)
- Prompt regeneration rate (lower is better - indicates first-try success)
- User satisfaction with "ワクワクする" (exciting/delightful) experience

## Future Vision

While the current focus is on TKZ and コボちゃん's workflow, the platform's architecture supports:
- **Multi-user expansion**: Adding more team members
- **API integration**: Direct tool linking and metadata fetching
- **Advanced analytics**: Usage patterns and tool effectiveness tracking
- **Cross-platform sync**: Desktop and mobile app versions
- **AI model expansion**: Support for other generative AI platforms beyond Sora2

---

*Last Updated: 2025-10-23*
*Target Users: 2 (TKZ, コボちゃん)*
*Status: Active Development - Phase 5 Complete (Soft Delete Implementation)*
