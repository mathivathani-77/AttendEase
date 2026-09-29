package com.example.attendease_api.service;

import com.example.attendease_api.model.Attendance;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AttendanceService {
    Attendance markAttendance(Attendance attendance);
    List<Attendance> getByClassroomAndDate(Long classroomId, LocalDate date);
    List<Attendance> getByStudent(Long studentId);
    Map<String, Object> getStudentSummary(Long studentId);
}
