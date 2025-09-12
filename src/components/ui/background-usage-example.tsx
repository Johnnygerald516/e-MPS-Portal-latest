"use client";

import React from "react";
import { AgriculturalBackground } from "./agricultural-background";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Button } from "./button";

/**
 * This is an example component showing how to use the agricultural backgrounds
 * in different UI elements throughout your application.
 */
export function BackgroundUsageExample() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Agricultural Background Examples</h2>
      
      {/* Example with farm pattern */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Farm Pattern Background</h3>
        <AgriculturalBackground type="farm" opacity={0.1} className="rounded-lg">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle>Farm Services</CardTitle>
              <CardDescription>Agricultural services for farming operations</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Access farm registration, permits, and subsidies through our platform.</p>
            </CardContent>
            <CardFooter>
              <Button>Learn More</Button>
            </CardFooter>
          </Card>
        </AgriculturalBackground>
      </div>
      
      {/* Example with hoes pattern */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Hoes Pattern Background</h3>
        <AgriculturalBackground type="hoes" opacity={0.1} className="rounded-lg">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle>Equipment Registration</CardTitle>
              <CardDescription>Register your agricultural equipment</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Register your farming tools and equipment for proper documentation.</p>
            </CardContent>
            <CardFooter>
              <Button>Register Now</Button>
            </CardFooter>
          </Card>
        </AgriculturalBackground>
      </div>
      
      {/* Example with tractor pattern */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Tractor Pattern Background</h3>
        <AgriculturalBackground type="tractor" opacity={0.1} className="rounded-lg">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle>Machinery Services</CardTitle>
              <CardDescription>Heavy machinery registration and permits</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Register tractors, harvesters, and other heavy machinery for agricultural use.</p>
            </CardContent>
            <CardFooter>
              <Button>Apply for Permit</Button>
            </CardFooter>
          </Card>
        </AgriculturalBackground>
      </div>
      
      {/* Example with fishing nets pattern */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Fishing Nets Pattern Background</h3>
        <AgriculturalBackground type="fishing-nets" opacity={0.1} className="rounded-lg">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle>Fishing Licenses</CardTitle>
              <CardDescription>Apply for commercial and recreational fishing permits</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Get your fishing license and boat registration through our streamlined process.</p>
            </CardContent>
            <CardFooter>
              <Button>Get License</Button>
            </CardFooter>
          </Card>
        </AgriculturalBackground>
      </div>
      
      {/* Example with combined pattern */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Combined Agricultural Background</h3>
        <AgriculturalBackground type="combined" opacity={0.15} className="rounded-lg">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle>All Agricultural Services</CardTitle>
              <CardDescription>Complete suite of agricultural services</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Access all our agricultural services in one place - farming, equipment, machinery, and fishing.</p>
            </CardContent>
            <CardFooter>
              <Button>Explore Services</Button>
            </CardFooter>
          </Card>
        </AgriculturalBackground>
      </div>
    </div>
  );
}
