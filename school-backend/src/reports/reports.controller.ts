import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Role } from '@prisma/client';
import { ReportsService } from './reports.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('report-card/:studentId')
  async reportCard(
    @Param('studentId') studentId: string,
    @Query('examTitle') examTitle: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    if (!examTitle) throw new BadRequestException('examTitle query param is required');
    const doc = await this.reportsService.createReportCardDocument(studentId, examTitle, req.user);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="report-card-${studentId}.pdf"`,
    });
    doc.pipe(res);
    doc.end();
  }

  @Get('admit-card/:studentId')
  async admitCard(
    @Param('studentId') studentId: string,
    @Query('examTitle') examTitle: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    if (!examTitle) throw new BadRequestException('examTitle query param is required');
    const doc = await this.reportsService.createAdmitCardDocument(studentId, examTitle, req.user);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="admit-card-${studentId}.pdf"`,
    });
    doc.pipe(res);
    doc.end();
  }

  @Post('certificate/:studentId')
  async certificate(
    @Param('studentId') studentId: string,
    @Body() input: CreateCertificateDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    if (![Role.ADMIN, Role.PRINCIPAL].includes(req.user.role)) {
      throw new ForbiddenException('Only Admin or Principal can issue certificates');
    }
    const doc = await this.reportsService.createCertificateDocument(studentId, input, req.user);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="certificate-${studentId}.pdf"`,
    });
    doc.pipe(res);
    doc.end();
  }
}