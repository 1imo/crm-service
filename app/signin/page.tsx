'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2, Package } from "lucide-react";

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
            } else if (result?.ok) {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            console.error('Sign in error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full flex items-center justify-center">
                <div className="w-full max-w-[400px] p-4">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Package className="h-6 w-6" />
                            <span className="font-bold text-xl">PapStore CRM</span>
                        </div>
                    </div>

                    <Card className="border bg-background/95 backdrop-blur w-full shadow-none">
                        <CardHeader>
                            <CardTitle>Welcome back</CardTitle>
                            <CardDescription>
                                Sign in to your account to continue
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign in'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        © {new Date().getFullYear()} PapStore. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
} 