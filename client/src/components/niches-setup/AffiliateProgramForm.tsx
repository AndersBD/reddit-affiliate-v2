import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PlusIcon, TrashIcon } from "lucide-react";

// Define the shape of an affiliate program
interface AffiliateProgram {
  id: number;
  name: string;
  company: string;
  description: string;
  commission: string;
  category: string;
  website: string;
  createdAt?: string;
}

interface AffiliateProgramFormProps {
  existingPrograms: AffiliateProgram[];
  isLoading: boolean;
  onComplete: () => void;
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, { message: "Program name must be at least 3 characters" }),
  company: z.string().min(2, { message: "Company name is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  commission: z.string().min(1, { message: "Commission details are required" }),
  category: z.string().min(1, { message: "Category is required" }),
  website: z.string().url({ message: "Must be a valid URL" }),
});

export function AffiliateProgramForm({ 
  existingPrograms, 
  isLoading,
  onComplete 
}: AffiliateProgramFormProps) {
  const [isAddMode, setIsAddMode] = useState(false);
  const { toast } = useToast();
  
  // Setup the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",
      description: "",
      commission: "",
      category: "",
      website: "",
    },
  });
  
  // Mutation for adding new program
  const addProgramMutation = useMutation({
    mutationFn: (newProgram: z.infer<typeof formSchema>) => {
      return apiRequest("/api/affiliate-programs", {
        method: "POST",
        body: JSON.stringify(newProgram),
      });
    },
    onSuccess: () => {
      // Invalidate and refetch the programs
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate-programs'] });
      
      // Reset form and show toast
      form.reset();
      setIsAddMode(false);
      
      toast({
        title: "Success",
        description: "Affiliate program added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add affiliate program",
        variant: "destructive",
      });
    },
  });
  
  // Delete program mutation
  const deleteProgramMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/affiliate-programs/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate-programs'] });
      toast({
        title: "Success",
        description: "Program deleted successfully",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addProgramMutation.mutate(values);
  };

  // Categories options
  const categoryOptions = [
    { value: "content-creation", label: "Content Creation" },
    { value: "seo", label: "SEO" },
    { value: "web-dev", label: "Web Development" },
    { value: "ai-tools", label: "AI Tools" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "finance", label: "Personal Finance" },
    { value: "education", label: "Online Education" },
    { value: "marketing", label: "Digital Marketing" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-medium">Affiliate Programs</h3>
        <p className="text-sm text-muted-foreground">
          Add affiliate programs you want to promote in your selected niches
        </p>
      </div>

      {/* Programs Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Program Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : existingPrograms.length > 0 ? (
              existingPrograms.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell>{program.company}</TableCell>
                  <TableCell>{program.category}</TableCell>
                  <TableCell>{program.commission}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProgramMutation.mutate(program.id)}
                      disabled={deleteProgramMutation.isPending}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No affiliate programs added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Program Button */}
      {!isAddMode && (
        <Button
          variant="outline"
          onClick={() => setIsAddMode(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add New Program
        </Button>
      )}

      {/* Add Program Form */}
      {isAddMode && (
        <div className="space-y-4 rounded-md border p-4">
          <h4 className="font-medium">Add New Affiliate Program</h4>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Amazon Associates" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Amazon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://affiliate-program.amazon.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="commission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Rate</FormLabel>
                      <FormControl>
                        <Input placeholder="Up to 10% depending on category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the affiliate program" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddMode(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={addProgramMutation.isPending}
                >
                  {addProgramMutation.isPending ? "Adding..." : "Add Program"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
      
      <div className="flex justify-end pt-4">
        <Button
          onClick={onComplete}
          disabled={existingPrograms.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}