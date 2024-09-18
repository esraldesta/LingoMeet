import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import API from "../../api/axios";
import { useToast } from "../ui/use-toast";
import { useGroups } from "../../context/GroupContext";
export function CreateGroup() {
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [Topic, setTopic] = useState("");
  const [language, setLanguage] = useState([]);
  const { setGroups } = useGroups();
  const HandleSubmit = () => {
    API.post("/", {
      title,
      Topic,
      language,
    })
      .then((res) => {
        setGroups((prevGroups) => [...prevGroups, res.data.data]);
        toast({
          description: "Group created successfuly",
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          description: "Group create Failed",
        });
      });
  };
  return (
    <AlertDialog>
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
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="topic" className="text-right">
              Topic
            </Label>
            <Input
              id="topic"
              value={Topic}
              onChange={(e) => {
                setTopic(e.target.value);
              }}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lang" className="text-right">
            Language
            </Label>
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
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={HandleSubmit}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
