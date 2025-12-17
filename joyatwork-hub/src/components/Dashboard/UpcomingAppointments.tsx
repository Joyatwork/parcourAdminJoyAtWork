import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin,
  Plus
} from "lucide-react";

export function UpcomingAppointments() {
  const appointments = [
    {
      id: 1,
      practitioner: "Dr. Martin",
      specialty: "Médecin généraliste",
      date: "Aujourd'hui",
      time: "14:30",
      type: "video",
      status: "confirmed"
    },
    {
      id: 2,
      practitioner: "Sophie L.",
      specialty: "Psychologue",
      date: "Demain",
      time: "10:00",
      type: "office",
      status: "confirmed"
    },
    {
      id: 3,
      practitioner: "Dr. Dubois",
      specialty: "Nutritionniste",
      date: "Vendredi",
      time: "16:15",
      type: "video",
      status: "pending"
    }
  ];

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground">Rendez-vous</h3>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau
        </Button>
      </div>

      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="p-4 rounded-lg border bg-gradient-to-r from-background to-muted/30 hover:shadow-soft transition-all">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-primary text-white text-sm">
                  {appointment.practitioner.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-foreground">{appointment.practitioner}</h4>
                  <Badge 
                    variant={appointment.status === "confirmed" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {appointment.status === "confirmed" ? "Confirmé" : "En attente"}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{appointment.specialty}</p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {appointment.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {appointment.time}
                  </div>
                  <div className="flex items-center gap-1">
                    {appointment.type === "video" ? (
                      <>
                        <Video className="w-3 h-3" />
                        Visio
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3" />
                        Cabinet
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full mt-4">
        Voir tous les rendez-vous
      </Button>
    </Card>
  );
}