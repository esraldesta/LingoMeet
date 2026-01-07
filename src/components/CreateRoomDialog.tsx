

import { useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Loader, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

const defaultValue = {
    name: "",
    description: "",
    language: "English",
    topic: "",
    roomType: "general",
    isPublic: true,
    maxParticipants: 5,
}

function CreateRoomDialog({ onSuccess }: { onSuccess: () => void }) {
    const [formData, setFormData] = useState(defaultValue);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const response = await fetch("/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setFormData(defaultValue)
                onSuccess();
                setOpen(false)
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to create room")
            }
        } catch (err) {
            toast.error("An unexpected error occurred")

        } finally {
            setLoading(false);
        }
    };

    return (

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus/>Create Room
                </Button>
            </DialogTrigger>
            <DialogContent className="p-6 rounded-lg shadow-xl w-full max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Room</DialogTitle>
                    <DialogDescription>
                        Create room where you would practice your speaking skill. Click create when you&apos;re
                        done.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Room Name
                        </label>
                        <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Description
                        </label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Language
                        </label>
                        <Select
                            value={formData.language}
                            onValueChange={(value) => setFormData({ ...formData, language: value })}
                        >
                            <SelectTrigger className="w-45">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>

                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Spanish">Spanish</SelectItem>
                                <SelectItem value="French">French</SelectItem>
                                <SelectItem value="German">German</SelectItem>
                                <SelectItem value="Italian">Italian</SelectItem>
                                <SelectItem value="Portuguese">Portuguese</SelectItem>
                                <SelectItem value="Japanese">Japanese</SelectItem>
                                <SelectItem value="Chinese">Chinese</SelectItem>
                                <SelectItem value="Korean">Korean</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Room Type
                        </label>
                        <Select
                            value={formData.roomType}
                            onValueChange={(value) => setFormData({ ...formData, roomType: value })}
                        >
                            <SelectTrigger className="w-45">
                                <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="ai">AI Practice</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Max Participants
                        </label>
                        <Input
                            type="number"
                            min="2"
                            max="20"
                            value={formData.maxParticipants}
                            onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                            className="w-45"
                        />
                    </div>

                    <div className="flex items-center">
                        <Checkbox
                            id="isPublic"
                            checked={formData.isPublic}
                            onCheckedChange={(checked: boolean) => setFormData({ ...formData, isPublic: checked })}
                            className="mr-2"
                        />

                        <label htmlFor="isPublic" className="text-sm">
                            Public Room
                        </label>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <DialogClose className="flex-1" asChild>
                            <Button className='bg-secondary text-foreground' disabled={loading}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary"
                        >
                            {loading ? <Loader /> : 'Create'}
                        </Button>

                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateRoomDialog;
