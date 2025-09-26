import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Users, BookOpen, Star } from "lucide-react";

const Videos: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;

  // Mock data for video categories and content
  const videoCategories = [
    {
      category: "Getting Started",
      videos: [
        {
          title: "Introduction to Forlab+ Platform",
          duration: "3:45",
          views: 1250,
          rating: 4.8,
          thumbnail: "/placeholder.svg",
          description: "Learn the basics of navigating the Forlab+ platform"
        },
        {
          title: "Setting Up Your Profile",
          duration: "2:30",
          views: 980,
          rating: 4.6,
          thumbnail: "/placeholder.svg",
          description: "Complete your profile setup for optimal experience"
        }
      ]
    },
    {
      category: "Forecasting",
      videos: [
        {
          title: "Creating Your First Forecast",
          duration: "8:15",
          views: 2100,
          rating: 4.9,
          thumbnail: "/placeholder.svg",
          description: "Step-by-step guide to creating accurate forecasts"
        },
        {
          title: "Advanced Forecasting Techniques",
          duration: "12:30",
          views: 1850,
          rating: 4.7,
          thumbnail: "/placeholder.svg",
          description: "Master advanced forecasting methods and best practices"
        },
        {
          title: "Forecast Validation & Approval",
          duration: "6:45",
          views: 1650,
          rating: 4.8,
          thumbnail: "/placeholder.svg",
          description: "Learn the validation workflow and approval process"
        }
      ]
    },
    {
      category: "Budget Management",
      videos: [
        {
          title: "CDSS Budget Alignment",
          duration: "9:20",
          views: 1400,
          rating: 4.5,
          thumbnail: "/placeholder.svg",
          description: "Understanding CDSS budget alignment and monitoring"
        },
        {
          title: "Cost Analysis and Reporting",
          duration: "7:10",
          views: 1200,
          rating: 4.6,
          thumbnail: "/placeholder.svg",
          description: "Generate comprehensive cost analysis reports"
        }
      ]
    },
    {
      category: "Supply Planning",
      videos: [
        {
          title: "Supply Chain Optimization",
          duration: "10:45",
          views: 1100,
          rating: 4.7,
          thumbnail: "/placeholder.svg",
          description: "Optimize your supply chain for better efficiency"
        },
        {
          title: "Inventory Management Best Practices",
          duration: "8:30",
          views: 950,
          rating: 4.4,
          thumbnail: "/placeholder.svg",
          description: "Learn effective inventory management strategies"
        }
      ]
    }
  ];

  const formatDuration = (duration: string) => duration;
  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  return (
    <main className="container py-6 space-y-6">
      <Helmet>
        <title>Micro-learning Videos | Forlab+ Platform</title>
        <meta name="description" content="Access comprehensive video tutorials and micro-learning content for the Forlab+ platform. Learn forecasting, budget management, and supply planning." />
        <link rel="canonical" href={canonical} />
      </Helmet>


      {/* Video Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Play className="h-8 w-8 text-brand" />
              <div>
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm text-muted-foreground">Total Videos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-moh-secondary" />
              <div>
                <div className="text-2xl font-bold">2.5h</div>
                <div className="text-sm text-muted-foreground">Total Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-status-ok" />
              <div>
                <div className="text-2xl font-bold">15.2k</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-status-warning" />
              <div>
                <div className="text-2xl font-bold">4.7</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Categories */}
      <div className="space-y-8">
        {videoCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-semibold">{category.category}</h2>
              <Badge variant="secondary">{category.videos.length} videos</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.videos.map((video, videoIndex) => (
                <Card key={videoIndex} className="surface hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="relative">
                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                      <Play className="h-12 w-12 text-muted-foreground group-hover:text-brand transition-colors" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {video.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <span>{formatViews(video.views)} views</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-status-warning text-status-warning" />
                          <span>{video.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Video
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Learning Path Suggestion */}
      <Card className="surface border-brand/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand" />
            Recommended Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            New to Forlab+? Follow our recommended learning path to get up to speed quickly:
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">1. Platform Introduction</Badge>
            <Badge variant="outline">2. Profile Setup</Badge>
            <Badge variant="outline">3. Creating Forecasts</Badge>
            <Badge variant="outline">4. Budget Alignment</Badge>
            <Badge variant="outline">5. Advanced Features</Badge>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Videos;