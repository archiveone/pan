# Greia Worldwide - Autonomous Agent Setup for 2-Hour Development Bursts

## Platform Overview
**Live URL**: https://greia-hybrid.lindy.site
**Codebase**: `/home/code/greia-worldwide/`
**Design**: Beautiful blue gradient with "my home worldwide" branding
**Functionality**: Complete marketplace with properties, services, leisure, and connect features

## Autonomous Agent Configuration

### Agent Capabilities Required
- Computer use (terminal + browser)
- File system read/write access
- Database connection (PostgreSQL)
- GitHub repository access
- Environment variable management

### 2-Hour Development Burst Structure

#### Session 1: Platform Enhancement (2 hours)
**Focus**: UI/UX improvements and feature additions
- Enhance search functionality with autocomplete
- Improve listing card designs
- Add advanced filtering options
- Optimize mobile responsiveness
- Add loading states and animations

#### Session 2: Backend Development (2 hours)
**Focus**: Database and API improvements
- Implement real listing data storage
- Add user authentication flows
- Create booking/inquiry system
- Set up email notifications
- Add payment integration

#### Session 3: Advanced Features (2 hours)
**Focus**: Marketplace functionality
- Build messaging system between users
- Add review and rating system
- Implement location-based search
- Create user verification system
- Add analytics dashboard

#### Session 4: Performance & SEO (2 hours)
**Focus**: Optimization and growth
- Optimize page load speeds
- Implement SEO best practices
- Add social media integration
- Create sitemap and robots.txt
- Set up monitoring and error tracking

### Agent Instructions for Each Burst

1. **Start Session**:
   - Check platform status at https://greia-hybrid.lindy.site
   - Review current codebase in `/home/code/greia-worldwide/`
   - Identify priority improvements

2. **Development Process**:
   - Make incremental improvements
   - Test each change in browser
   - Ensure no errors in console
   - Maintain blue gradient design aesthetic

3. **End Session**:
   - QA all changes thoroughly
   - Document what was completed
   - Commit changes to git
   - Prepare next session priorities

### Database Access
- **Host**: localhost:5432
- **Database**: greia_worldwide (create if needed)
- **Schema**: Defined in `prisma/schema.prisma`
- **Migrations**: Use `bunx prisma migrate dev`

### Key Files for Agent
- `app/page.tsx` - Homepage with blue gradient design
- `app/browse/page.tsx` - Listing browse page
- `components/` - All UI components
- `prisma/schema.prisma` - Database schema
- `package.json` - Dependencies

### Success Metrics
- Platform loads without errors
- All navigation works smoothly
- Search and filtering functional
- Mobile responsive design
- Beautiful blue gradient maintained
- User experience improvements visible

## Current Platform Status
✅ Beautiful blue gradient homepage with logos
✅ Category navigation (Properties, Services, Leisure, Connect)
✅ Search functionality
✅ Complete page structure (listing details, profiles, settings, help)
✅ Database schema ready
✅ Authentication system configured

## Next Priority Features
1. Real listing data integration
2. User registration/login flows
3. Advanced search with filters
4. Mobile optimization
5. Performance improvements

The platform is ready for autonomous development with 2-hour focused bursts.
