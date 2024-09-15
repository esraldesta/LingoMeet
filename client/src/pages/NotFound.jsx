import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Transition from "../components/Transition";

export default function NotFound() {
  return (
    <Transition>
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">404</CardTitle>
          <CardDescription>Page Not Found</CardDescription>
        </CardHeader>
        <CardContent></CardContent>
        <CardFooter>
          <Button className="w-full">
            <Link to="/">back to home</Link>
          </Button>
        </CardFooter>
      </Card>
    </Transition>
  );
}
