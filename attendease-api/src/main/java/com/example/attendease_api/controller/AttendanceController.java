package com.example.attendease_api.controller;
import com.example.attendease_api.model.Attendance;
import com.example.attendease_api.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    public Attendance mark(@RequestBody Attendance attendance) {
        return attendanceService.markAttendance(attendance);
    }

    @GetMapping("/classroom/{id}")
    public List<Attendance> byClassroom(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return attendanceService.getByClassroomAndDate(id, date);
    }

    @GetMapping("/student/{id}")
    public List<Attendance> byStudent(@PathVariable Long id) {
        return attendanceService.getByStudent(id);
    }

    @GetMapping("/student/{id}/summary")
    public Map<String, Object> summary(@PathVariable Long id) {
        return attendanceService.getStudentSummary(id);
    }
}
