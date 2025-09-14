import React from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Waves, AlertTriangle, BarChart3, Database, MapPin, Calendar } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              About AquaMonitor
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive water level monitoring and prediction system for stream and groundwater management
            </p>
          </div>

          {/* What is AquaMonitor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-6 w-6 text-primary" />
                What is AquaMonitor?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                AquaMonitor is a real-time water level monitoring and prediction platform designed to help municipalities, 
                environmental agencies, and researchers track stream and groundwater conditions. Our system combines 
                live sensor data with predictive modeling to provide accurate forecasts and early warning capabilities.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">For Users</h4>
                  <p className="text-sm text-muted-foreground">
                    Get instant access to current water levels, trend analysis, and 7-day predictions 
                    for monitoring stations across your region. Perfect for flood monitoring, drought assessment, 
                    and environmental planning.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">For Professionals</h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced analytics, historical data comparison, and administrative tools for managing 
                    monitoring networks. Ideal for water resource management and environmental consulting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                How Our Predictions Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <Database className="h-8 w-8 text-primary mx-auto" />
                  <h4 className="font-semibold">Data Collection</h4>
                  <p className="text-sm text-muted-foreground">
                    Continuous monitoring from network sensors collecting water level, precipitation, and environmental data
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <Calendar className="h-8 w-8 text-primary mx-auto" />
                  <h4 className="font-semibold">Historical Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Analysis of the last 30 days of water table data combined with seasonal patterns and trends
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto" />
                  <h4 className="font-semibold">Predictive Modeling</h4>
                  <p className="text-sm text-muted-foreground">
                    Generalized water table model generates 7-day forecasts based on historical patterns and trends
                  </p>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Understanding Water Level Predictions
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-sm mb-1">What Are Percentiles?</h5>
                    <p className="text-sm text-muted-foreground">
                      Percentiles help you understand where current water levels rank compared to historical data:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                      <li>• <strong>Low percentile (10th-30th):</strong> Water levels are lower than they typically are at this time of year</li>
                      <li>• <strong>High percentile (70th-90th):</strong> Water levels are higher than they typically are at this time of year</li>
                      <li>• <strong>50th percentile (median):</strong> Water levels are about average for this time of year</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-1">Status Indicators Explained</h5>
                    <div className="grid md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2">
                        <span className="font-medium text-green-700 dark:text-green-300">Normal:</span>
                        <p className="text-green-600 dark:text-green-400 mt-1">Water levels are within the typical safe range for this location</p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2">
                        <span className="font-medium text-yellow-700 dark:text-yellow-300">Warning:</span>
                        <p className="text-yellow-600 dark:text-yellow-400 mt-1">Water levels are elevated and require monitoring for potential issues</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                        <span className="font-medium text-red-700 dark:text-red-300">Danger:</span>
                        <p className="text-red-600 dark:text-red-400 mt-1">Water levels are at or near flood stage - immediate attention required</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Badge variant="secondary" className="mb-2">Average Accuracy: 85-92%</Badge>
                    <p className="text-sm text-muted-foreground">
                      Our models achieve high accuracy under normal conditions with sufficient historical data and nearby weather stations
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Note:</strong> Accuracy varies based on data quality, seasonal factors, local conditions, and proximity to weather monitoring stations
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                Technical Specifications
              </CardTitle>
              <CardDescription>
                Detailed information about our monitoring and prediction systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Data Sources</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Real-time water level sensors</li>
                    <li>• Meteorological stations</li>
                    <li>• Precipitation gauges</li>
                    <li>• Historical water table data</li>
                    <li>• Geological and topographical data</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Model Parameters</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 30-day historical data window</li>
                    <li>• 7-day prediction horizon</li>
                    <li>• 15-minute data update intervals</li>
                    <li>• Multi-variable regression analysis</li>
                    <li>• Seasonal trend adjustments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Limitations */}
          <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-6 w-6" />
                Important Limitations & Considerations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Weather Station Dependency</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Prediction accuracy may be significantly lower if no nearby weather station is available. 
                      Our models rely on local meteorological data for optimal performance.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <BarChart3 className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Model Generalization</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Predictions are based on a generalized water table model. Local geological conditions, 
                      human activities, or unique environmental factors may not be fully captured.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Extreme Conditions</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Predictions may be less reliable during extreme weather events, seasonal transitions, 
                      or unprecedented conditions that fall outside historical patterns.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Database className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Data Quality Requirements</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Accuracy depends on the quality and completeness of the last 30 days of water table data. 
                      Sensor malfunctions or data gaps can impact prediction reliability.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-lg p-3 mt-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  💡 Always use predictions as guidance alongside local knowledge and official weather warnings. 
                  For critical decisions, consult with local water management authorities.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Support */}
          <Card>
            <CardHeader>
              <CardTitle>Support & Contact</CardTitle>
              <CardDescription>
                Need help or have questions about our monitoring system?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Technical Support</h4>
                  <p className="text-sm text-muted-foreground">
                    For technical issues, data inquiries, or API access, contact our technical team.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data & Research</h4>
                  <p className="text-sm text-muted-foreground">
                    Interested in historical data, research collaboration, or custom monitoring solutions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default About;