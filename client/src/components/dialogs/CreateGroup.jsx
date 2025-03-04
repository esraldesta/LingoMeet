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
import { useState } from "react";
import { toast } from "sonner";
import API from "@/api/axios";
import { useGroups } from "@/context/GroupContext";

export function CreateGroup() {
  const [title, setTitle] = useState("");
  const [Topic, setTopic] = useState("");
  const [language, setLanguage] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);

  const { setGroups } = useGroups();
  const HandleSubmit = () => {
    setIsLoading(true);
    API.post("/", {
      title,
      Topic,
      language,
    })
      .then((res) => {
        setErrors({});
        setIsLoading(false);
        setTitle("");
        setTopic("");
        setLanguage("");
        setGroups((prevGroups) => [...prevGroups, res.data.data]);
        setOpen(false);
        toast({
          description: "Group created successfuly",
        });
      })
      .catch((err) => {
        const responseErrors = err.response?.data.errors || [];
        const global = err.response?.data?.message;
        let tempErrors = {};
        responseErrors.forEach((errorObj) => {
          let errorMessage = errorObj.messages;

          tempErrors[errorObj.field] = errorMessage;
        });
        setErrors({ ...tempErrors, global });
        setIsLoading(false);
        toast({
          variant: "destructive",
          description: "Group create Failed",
        });
      });
  };
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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Group Name
            </Label>
            <div className="col-span-3">
              <span className="block mb-1">
                {errors.title && (
                  <div className="text-red-600 text-xs">{errors.title}</div>
                )}
              </span>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="topic" className="text-right">
              Topic
            </Label>
            <div className="col-span-3">
              <span className="block mb-1">
                {errors.topic && (
                  <div className="text-red-600 text-xs">{errors.topic}</div>
                )}
              </span>
              <Input
                id="topic"
                value={Topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                }}
                className="col-span-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lang" className="text-right">
              Language
            </Label>
            <div className="col-span-3">
              <span className="block mb-1">
                {errors.language && (
                  <div className="text-red-600 text-xs">{errors.language}</div>
                )}
              </span>
              <Input
                id="lang"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                }}
                className="col-span-3"
              />
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <div className="flex justify-end gap-2 items-center">
            <Button
              variant="secondary"
              disabled={isLoading}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isLoading} onClick={HandleSubmit}>
              Continue
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
