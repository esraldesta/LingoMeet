import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import API, { POST_API } from "@/api/axios";
import { useGroups } from "@/context/GroupContext";
import { set, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { group_schema, LEVELS } from "@/lib/validations";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { LoaderButton } from "../ui/loading-button";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronsDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Languages } from "@/constants";
import { ObjectToformData } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type ActionState = {
  errors: Record<string, { message: string }>;
  values: { [key: string]: any } | null;
};

async function handleSubmit(init: ActionState, fData: FormData) {
  return POST_API.post<any, ActionState>("/", fData);
}

export function CreateGroup() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const [state, formAction, isPending] = useActionState(handleSubmit, {
    values: null,
    errors: {},
  });

  const [_, startTransition] = useTransition();

  function handle(data: Zod.infer<typeof group_schema>) {
    const fData = ObjectToformData(data);
    startTransition(() => formAction(fData));
  }

  useEffect(() => {
    if (state.values) {
      setOpen(false);
      navigate(`/group/${state.values.id}`);
    }
  }, [state]);

  const form = useForm({
    resolver: zodResolver(group_schema),
    errors: state.errors,
    mode: "onBlur",
    defaultValues: {
      topic: "hey",
      maxPeople: 5,
      isPrivate: false,
      languages: ["en"],
      levels: [LEVELS[0]],
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="inline-flex z-50 items-center justify-center w-10 h-10 font-medium bg-blue-600 rounded-full hover:bg-blue-700 group focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
        >
          <svg
            className="w-4 h-4 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 18 18"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 1v16M1 9h16"
            />
          </svg>
          <span className="sr-only">New item</span>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Create Group</AlertDialogTitle>
          <AlertDialogDescription>Create Your own Group</AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            className="flex flex-col gap-2"
            onSubmit={form.handleSubmit(handle)}
          >
            {/* TOPIC */}
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Languages */}

            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1 w-full">
                  <FormLabel>Languages</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={`formInput justify-between ${
                            !field.value?.length && "text-muted-foreground"
                          }`}
                        >
                          <div className="font-normal overflow-x-hidden overflow-ellipsis">
                            {field.value?.length
                              ? field.value
                                  .map(
                                    (value) =>
                                      Languages.find(
                                        (lang) => lang.value === value
                                      )?.label
                                  )
                                  .join(", ")
                                  .slice(0, 30)
                              : "Select languages"}
                          </div>
                          <ChevronsDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search Languages..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No Languages found.</CommandEmpty>
                          <CommandGroup>
                            {Languages.map((language) => (
                              <CommandItem
                                key={language.value}
                                onSelect={() => {
                                  const newLanguages = field.value.includes(
                                    language.value
                                  )
                                    ? field.value.filter(
                                        (val) => val !== language.value
                                      )
                                    : [...field.value, language.value];
                                  form.setValue("languages", newLanguages); // Update multiple selected languages
                                }}
                              >
                                {language.label}
                                <Check
                                  className={`ml-auto ${
                                    field.value.includes(language.value)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            {/* LEVELS */}
            <FormField
              control={form.control}
              name="levels"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1 w-full">
                  <FormLabel>Levels</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={`formInput justify-between ${
                            !field.value?.length && "text-muted-foreground"
                          }`}
                        >
                          <div className="font-normal overflow-x-hidden overflow-ellipsis">
                            {field.value?.length
                              ? field.value
                                  .map((value) =>
                                    LEVELS.find((l) => l === value)
                                  )
                                  .join(", ")
                                  .slice(0, 30)
                              : "Select Levels"}
                          </div>
                          <ChevronsDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search Languages..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No Level found.</CommandEmpty>
                          <CommandGroup>
                            {LEVELS.map((level) => (
                              <CommandItem
                                key={level}
                                onSelect={() => {
                                  const newLevels = field.value.includes(level)
                                    ? field.value.filter((val) => val !== level)
                                    : [...field.value, level];
                                  form.setValue("levels", newLevels); // Update multiple selected languages
                                }}
                              >
                                {level}
                                <Check
                                  className={`ml-auto ${
                                    field.value.includes(level)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            {/* Number of People */}
            <FormField
              control={form.control}
              name="maxPeople"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max #People</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Private */}
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3 ">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  {/* <FormLabel>Private</FormLabel> */}
                  <div className="space-y-1 leading-none">
                    <FormLabel>Private </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <div className="flex justify-end gap-2 items-center">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <LoaderButton isLoading={isPending} type="submit">
                  Continue
                </LoaderButton>
              </div>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
